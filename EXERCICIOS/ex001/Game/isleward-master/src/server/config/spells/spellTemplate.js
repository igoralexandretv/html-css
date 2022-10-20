let combat = require('../../combat/combat');

module.exports = {
	cd: 0,
	cdMax: 0,
	manaCost: 1,
	threatMult: 1,

	casting: false,
	castTime: 0,
	castTimeMax: 0,

	needLos: false,
	//Should damage/heals caused by this spell cause events to be fired on objects?
	noEvents: false,

	currentAction: null,

	pendingAttacks: [],

	canCast: function (target) {
		if (this.cd > 0)
			return false;
		else if (this.manaCost > this.obj.stats.values.mana)
			return false;
		else if (!target)
			return true;
		
		let inRange = true;
		if (this.has('range')) {
			let obj = this.obj;
			let distance = Math.max(Math.abs(target.x - obj.x), Math.abs(target.y - obj.y));
			inRange = (distance <= this.range);
		}
		return inRange;
	},

	castBase: function (action) {
		if (this.castTimeMax > 0) {
			if ((!this.currentAction) || (this.currentAction.target !== action.target)) {
				this.currentAction = action;

				let castTimeMax = this.castTimeMax;

				let speedModifier = this.obj.stats.values[this.isAttack ? 'attackSpeed' : 'castSpeed'];
				castTimeMax = Math.ceil(castTimeMax * (1 - (Math.min(50, speedModifier) / 100)));

				let castEvent = {
					spell: this,
					castTimeMax: castTimeMax
				};
				this.obj.fireEvent('beforeGetSpellCastTime', castEvent);

				this.currentAction.castTimeMax = castEvent.castTimeMax;
				this.castTime = castEvent.castTimeMax;
				this.obj.syncer.set(false, null, 'casting', 0);
			}

			return null;
		}

		return this.cast(action);
	},

	updateBase: function () {
		//It's possible that we rezoned midway through casting (map regen)
		// We'll have a hanging cast bar but at least we won't crash
		if (this.castTime > 0 && !this.currentAction)
			this.castTime = 0;

		if (this.castTime > 0) {
			let action = this.currentAction;

			if (_.getDeepProperty(action, 'target.destroyed') || !this.canCast(action.target)) {
				this.currentAction = null;
				this.castTime = 0;
				this.obj.syncer.set(false, null, 'casting', 0);
				return;
			}

			this.castTime--;
			this.obj.syncer.set(false, null, 'casting', (action.castTimeMax - this.castTime) / action.castTimeMax);

			if (!this.castTime) {
				this.currentAction = null;

				if (this.cast(action)) {
					this.consumeMana();
					this.setCd();

					this.obj.fireEvent('afterCastSpell', {
						castSuccess: true,
						spell: this,
						action
					});
				}
			} else {
				if (this.onCastTick)
					this.onCastTick();
				
				this.sendBump(null, 0, -1);
			}

			return;
		}

		if (this.cd > 0) {
			this.cd--;

			if (this.cd === 0)
				this.obj.syncer.setArray(true, 'spellbook', 'getSpells', this.simplify());
		}
	},

	consumeMana: function () {
		let stats = this.obj.stats.values;
		stats.mana -= this.manaCost;

		if (this.obj.player)
			this.obj.syncer.setObject(true, 'stats', 'values', 'mana', stats.mana);
	},

	setCd: function () {
		let cd = {
			cd: this.cdMax
		};

		this.obj.fireEvent('beforeSetSpellCooldown', cd, this);

		this.cd = cd.cd;

		if (this.obj.player) {
			this.obj.instance.syncer.queue('onGetSpellCooldowns', {
				spell: this.id,
				cd: (this.cd * consts.tickTime)
			}, [this.obj.serverId]);
		}
	},

	setAuto: function (autoConfig) {
		this.autoActive = autoConfig;

		if (this.obj.player) {
			this.obj.instance.syncer.queue('onGetSpellActive', {
				id: this.obj.id,
				spell: this.id,
				cd: (this.cd * consts.tickTime),
				active: !!autoConfig
			}, [this.obj.serverId]);
		}
	},

	calcDps: function (target, noSync) {
		if ((!this.values) || (this.spellType === 'buff') || (this.spellType === 'aura'))
			return;

		if ((!this.damage) && (!this.healing))
			delete this.values.dps;
		else {
			let noMitigate = !target;

			let dmg = combat.getDamage({
				source: this.obj,
				target: (target || {
					stats: {
						values: {}
					}
				}),
				damage: (this.damage || this.healing) * (this.dmgMult || 1),
				cd: this.cdMax,
				element: this.element,
				statType: this.statType,
				statMult: this.statMult,
				noMitigate: noMitigate,
				isAttack: this.isAttack,
				noCrit: true
			}).amount;

			let statValues = this.obj.stats.values;

			let critChance = statValues.critChance + (this.isAttack ? statValues.attackCritChance : statValues.spellCritChance);
			let critMultiplier = statValues.critMultiplier + (this.isAttack ? statValues.attackCritMultiplier : statValues.spellCritMultiplier);

			let castTimeMax = this.castTimeMax;
			let speedModifier = this.obj.stats.values[this.isAttack ? 'attackSpeed' : 'castSpeed'];
			castTimeMax = Math.ceil(castTimeMax * (1 - (Math.min(50, speedModifier) / 100)));
			critChance = Math.min(critChance, 100);
			dmg = (((dmg / 100) * (100 - critChance)) + (((dmg / 100) * critChance) * (critMultiplier / 100)));
			let duration = this.values.duration;
			if (duration) 
				dmg *= duration;

			const div = (this.cdMax + castTimeMax) || 1;
			dmg /= div;

			if (this.damage) 
				this.values.dmg = ~~(dmg * 100) / 100 + '/tick';
			else
				this.values.heal = ~~(dmg * 100) / 100 + '/tick';

			if (!noSync)
				this.obj.syncer.setArray(true, 'spellbook', 'getSpells', this.simplify());
		}
	},

	sendAnimation: function (blueprint) {
		this.obj.instance.syncer.queue('onGetObject', blueprint, -1);
	},

	sendBump: function (target, deltaX, deltaY) {
		if (target) {
			let x = this.obj.x;
			let y = this.obj.y;

			let tx = target.x;
			let ty = target.y;

			if (tx < x)
				deltaX = -1;
			else if (tx > x)
				deltaX = 1;

			if (ty < y)
				deltaY = -1;
			else if (ty > y)
				deltaY = 1;
		}

		let components = [{
			type: 'bumpAnimation',
			deltaX: deltaX,
			deltaY: deltaY
		}];

		//During casting we only bump
		if ((target) && (this.animation)) {
			components.push({
				type: 'animation',
				template: this.animation
			});
		}

		this.obj.instance.syncer.queue('onGetObject', {
			id: this.obj.id,
			components: components
		}, -1);
	},

	simplify: function (self) {
		let values = {};
		for (let p in this) {
			let value = this[p];
			let type = typeof(value);

			if (
				type === 'undefined' ||
				type === 'function' || 
				(
					type === 'number' &&
					isNaN(value)
				) ||
				['obj', 'currentAction', 'events'].includes(p)
			)
				continue;

			if (p === 'autoActive') 
				value = value !== null;

			values[p] = value;
		}

		if (this.animation)
			values.animation = this.animation.name;
		if (this.values)
			values.values = this.values;

		if (this.onAfterSimplify)
			this.onAfterSimplify(values);

		return values;
	},

	getDamage: function (target, noMitigate) {
		let config = {
			source: this.obj,
			target: target,
			damage: (this.damage || this.healing) * (this.dmgMult || 1),
			cd: this.cdMax,
			element: this.element,
			statType: this.statType,
			statMult: this.statMult,
			isAttack: this.isAttack,
			noScale: this.noScale,
			noMitigate: noMitigate,
			spell: this
		};

		if (this.obj.mob)
			config.noCrit = true;

		this.obj.fireEvent('onBeforeCalculateDamage', config);

		if (this.percentDamage)
			config.damage = target.stats.values.hpMax * this.damage;

		let damage = combat.getDamage(config);
		damage.noEvents = this.noEvents;

		return damage;
	},

	queueCallback: function (callback, delay, destroyCallback, target, destroyOnRezone) {
		return this.obj.spellbook.registerCallback(this.obj.id, callback, delay, destroyCallback, target ? target.id : null, destroyOnRezone);
	},

	die: function () {
		//We unregister callbacks where we are the source OR the target
		this.obj.spellbook.unregisterCallback(this.obj.id);
		this.obj.spellbook.unregisterCallback(this.obj.id, true);
	}
};
