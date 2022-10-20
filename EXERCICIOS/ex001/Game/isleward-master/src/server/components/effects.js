const effectTemplate = require('../config/effects/effectTemplate');

module.exports = {
	type: 'effects',

	effects: [],
	nextId: 0,

	ccResistances: {
		stunned: 0,
		slowed: 0
	},

	init: function (blueprint) {
		let effects = blueprint.effects || [];
		let eLen = effects.length;
		for (let i = 0; i < eLen; i++) {
			let e = effects[i];
			if (!e.type)
				continue;

			this.addEffect(e);
		}

		delete blueprint.effects;
	},

	transfer: function () {
		let transferEffects = this.effects;
		this.effects = [];

		this.init({
			effects: transferEffects
		});
	},

	save: function () {
		let e = {
			type: 'effects',
			effects: this.effects
				.map(f => f.save ? f.save() : f)
				.filter(f => !!f)
		};

		return e;
	},

	simplify: function (self) {
		let e = {
			type: 'effects'
		};

		let effects = this.effects;
		if ((effects.length > 0) && (effects[0].obj)) {
			effects = effects
				.map(f => f.simplify())
				.filter(f => !!f);
		}
		e.effects = effects;

		return e;
	},

	destroy: function () {
		if (this.obj.instance)
			this.events.beforeRezone.call(this);
	},

	die: function () {
		this.events.beforeRezone.call(this, true);
	},

	reset: function () {
		let effects = this.effects;
		let eLen = effects.length;
		for (let i = 0; i < eLen; i++) {
			let effect = effects[i];

			if (effect.reset)
				effect.reset();
		}
	},

	reapply: function () {
		let effects = this.effects;
		let eLen = effects.length;
		for (let i = 0; i < eLen; i++) {
			let effect = effects[i];

			if (effect.reapply)
				effect.reapply();
		}
	},

	destroyEffect: function (effect) {
		this.obj.fireEvent('beforeDestroyEffect', effect);

		if (effect.events && effect.events.beforeDestroy)
			effect.events.beforeDestroy(effect);

		if (effect.destroy)
			effect.destroy();
	},

	events: {
		beforeRezone: function (forceDestroy) {
			let effects = this.effects;
			let eLen = effects.length;
			for (let i = 0; i < eLen; i++) {
				let effect = effects[i];
				if (!forceDestroy) {
					if (effect.persist) {
						this.syncRemove(effect.id);
						continue;
					}
				}

				this.destroyEffect(effect);

				this.syncRemove(effect.id);
				effects.splice(i, 1);
				eLen--;
				i--;
			}
		}
	},

	canApplyEffect: function (type) {
		if (!this.ccResistances.has(type))
			return true;

		let ccResistances = this.ccResistances;
		if ((100 - ccResistances[type]) >= 50) {
			ccResistances[type] += 50;
			return true;
		} return false;
	},

	addEffect: function (options, source) {
		//Skip 0-duration effects
		if ((options.has('ttl')) && (options.ttl === 0))
			return;

		options.caster = options.caster || source;

		//"X of Y in Z" cc resist check
		if (!options.force && !this.canApplyEffect(options.type))
			return;

		let oldEffect = this.effects.find(e => e.type === options.type);

		//If there is no existing effect or the effect is not stackable, make a new effect
		if (!oldEffect || !oldEffect.shouldStack)
			return this.buildEffect(options);
		
		//If the effect is stackable and the new effect should stack, stack with the old effect
		let shouldStack = oldEffect.shouldStack(options);
		if (shouldStack && oldEffect.incrementStack) {
			oldEffect.incrementStack(options);
			return oldEffect;
		}

		//Otherwise make a new effect
		return this.buildEffect(options);
	},

	getTypeTemplate: function (type) {
		let typeTemplate = null;
		if (type) {
			let capitalizedType = type[0].toUpperCase() + type.substr(1);
			let result = {
				type: type,
				url: 'config/effects/effect' + capitalizedType + '.js'
			};
			this.obj.instance.eventEmitter.emit('onBeforeGetEffect', result);

			typeTemplate = require('../' + result.url);
		}

		let builtEffect = extend({}, effectTemplate, typeTemplate);
		return builtEffect;
	},

	buildEffect: function (options) {
		let builtEffect = this.getTypeTemplate(options.type);

		for (let p in options) 
			builtEffect[p] = options[p];
		
		builtEffect.obj = this.obj;
		builtEffect.id = this.nextId++;
		builtEffect.silent = options.silent;

		if (builtEffect.init)
			builtEffect.init(options.source);

		this.effects.push(builtEffect);

		if (!options.silent)
			this.obj.syncer.setArray(false, 'effects', 'addEffects', builtEffect.simplify());

		this.obj.instance.eventEmitter.emit('onAddEffect', this.obj, builtEffect);

		return builtEffect;
	},

	syncExtend: function (id, data) {
		let effect = this.effects.find(e => e.id === id);
		if (!effect)
			return;

		//Never sync silent effects
		if (effect.silent)
			return;

		this.obj.syncer.setArray(true, 'effects', 'extendEffects', {
			id,
			data
		});
	},

	syncRemove: function (id) {
		let effect = this.effects.find(e => e.id === id);

		if (!effect)
			return;

		if (effect.silent)
			return;

		this.obj.syncer.setArray(false, 'effects', 'removeEffects', id);
	},

	removeEffect: function (id) {
		const effect = this.effects.find(e => e.id === id);

		//It's possible that something else has removed the effect
		if (!effect)
			return;

		this.destroyEffect(effect);

		this.syncRemove(effect.id);
		
		this.effects.spliceWhere(e => e.id === id);
	},

	removeEffectByType: function (type) {
		const effects = this.effects.filter(e => e.type === type);

		effects.forEach(e => this.removeEffect(e.id));
	},

	getEffectByType: function (effectType) {
		const effect = this.effects.find(e => e.type === effectType);

		return effect;
	},

	fireEvent: function (event, args) {
		let effects = this.effects;
		let eLen = effects.length;
		for (let i = 0; i < eLen; i++) {
			let e = effects[i];

			//Maybe the effect killed us?
			if (!e) {
				i--;
				eLen--;
				continue;
			}

			if (e.ttl === 0)
				continue;
			let events = e.events;
			if (!events)
				continue;

			let callback = events[event];
			if (!callback)
				continue;

			callback.apply(e, args);
		}
	},

	update: function () {
		let effects = this.effects;
		let eLen = effects.length;
		for (let i = 0; i < eLen; i++) {
			let e = effects[i];

			if (e.ttl > 0)
				e.ttl--;
			else if (e.ttl === 0)
				e.destroyed = true;

			if (e.update)
				e.update();

			if (e.destroyed) {
				this.destroyEffect(e);

				this.syncRemove(e.id);

				effects.splice(i, 1);
				eLen--;
				i--;
			}
		}

		for (let p in this.ccResistances) {
			if (this.ccResistances[p] > 0)
				this.ccResistances[p]--;
		}
	}
};
