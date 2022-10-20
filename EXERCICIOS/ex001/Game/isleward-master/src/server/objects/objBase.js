let components = require('../components/components');

module.exports = {
	components: [],

	actionQueue: [],

	eventListeners: [],

	addComponent: function (type, blueprint, isTransfer) {
		let cpn = this[type];
		if (!cpn) {
			let template = components.components[type];
			if (!template) {
				template = extend({
					type: type
				}, blueprint || {});
			}

			cpn = extend({}, template);
			cpn.obj = this;

			this.components.push(cpn);
			this[cpn.type] = cpn;
		}

		if (cpn.init && this.has('instance'))
			cpn.init(blueprint || {}, isTransfer);
		else {
			for (let p in blueprint) 
				cpn[p] = blueprint[p];
		}

		return cpn;
	},

	addBuiltComponent: function (cpn) {
		this[cpn.type] = cpn;
		cpn.obj = this;
		this.components.push(cpn);

		return cpn;
	},

	removeComponent: function (type) {
		let cpn = this[type];
		if (!cpn)
			return;

		cpn.destroyed = true;
	},

	extendComponent: function (ext, type, blueprint) {
		let template = require('../components/extensions/' + type);
		let cpn = this[ext];

		extend(cpn, template);

		if (template.init)
			cpn.init(blueprint);

		return cpn;
	},

	update: function () {
		let usedTurn = false;

		let cpns = this.components;
		let len = cpns.length;
		for (let i = 0; i < len; i++) {
			let c = cpns[i];

			if (c.destroyed) {
				this.syncer.setSelfArray(false, 'removeComponents', c.type);
				cpns.spliceWhere(f => (f === c));
				delete this[c.type];
				len--;
				i--;
			} else if (c.update) {
				if (c.update())
					usedTurn = true;
			}
		}

		if (!usedTurn) 
			this.performQueue();
	},

	getSimple: function (self, isSave, isTransfer) {
		let s = this.simplify(null, self, isSave, isTransfer);

		if (self && !isSave && this.syncer) {
			this.syncer.oSelf.components
				.forEach(c => {
					if (!this[c.type])
						s.components.push(c);
				});
		}

		return s;
	},

	simplify: function (o, self, isSave, isTransfer) {
		let result = {};
		if (!o) {
			result.components = [];
			o = this;
		}

		const syncTypes = ['portrait', 'area'];
		const ignoreKeysWhenNotSelf = ['account'];

		for (let p in o) {
			let value = o[p];
			if (value === null)
				continue;

			let type = typeof (value);
			if (type === 'function')
				continue;
			else if (type !== 'object') {
				if (self || !ignoreKeysWhenNotSelf.includes(p))
					result[p] = value;
			} else if (type === 'undefined')
				continue;
			else {
				if (value.type) {
					if (!value.simplify) {
						if (self) {
							result.components.push({
								type: value.type
							});
						}
					} else {
						let component = null;
						if (isSave && value.save)
							component = value.save();
						else if (isTransfer && value.simplifyTransfer)
							component = value.simplifyTransfer();
						else
							component = value.simplify(self);

						if (value.destroyed) {
							if (!component) {
								component = {
									type: value.type
								};
							}

							component.destroyed = true;
						}

						if (component)
							result.components.push(component);
					}
				} else if (syncTypes.includes(p))
					result[p] = value;

				continue;
			}
		}

		return result;
	},

	sendEvent: function (event, data) {
		process.send({
			method: 'event',
			id: this.serverId,
			data: {
				event: event,
				data: data
			}
		});
	},

	queue: function (msg) {
		const { action, auto, data: { priority } } = msg;

		if (action === 'spell') {
			let spellbook = this.spellbook;
			const isCasting = spellbook.isCasting();

			if (isCasting && (!priority || !spellbook.canCast(msg))) {
				if (auto)
					spellbook.queueAuto(msg);

				return;
			}
		
			if (isCasting)
				spellbook.stopCasting();

			this.actionQueue.spliceWhere(a => a.priority);
			this.actionQueue.splice(0, 0, msg);
		} else {
			if (priority) {
				this.spellbook.stopCasting();
				this.actionQueue.splice(0, 0, msg);
				return;
			}

			this.actionQueue.push(msg);
		}
	},

	dequeue: function () {
		if (this.actionQueue.length === 0)
			return null;

		return this.actionQueue.splice(0, 1)[0];
	},

	clearQueue: function () {
		if (this.has('serverId')) {
			this.instance.syncer.queue('onClearQueue', {
				id: this.id
			}, [this.serverId]);
		}

		this.actionQueue = [];

		this.fireEvent('clearQueue');
	},

	performAction: function (action) {
		if (action.instanceModule)
			return;

		let cpn = this[action.cpn];
		if (!cpn)
			return;

		cpn[action.method](action.data);
	},

	performQueue: function () {
		let q = this.dequeue();
		if (!q) 
			return;

		if (q.action === 'move') {
			let maxDistance = 1;
			if ((this.actionQueue[0]) && (this.actionQueue[0].action === 'move')) {
				let moveEvent = {
					sprintChance: this.stats.values.sprintChance || 0
				};
				this.fireEvent('onBeforeTryMove', moveEvent);

				let physics = this.instance.physics;
				let sprintChance = moveEvent.sprintChance;				
				do {
					if ((~~(Math.random() * 100) < sprintChance) && (!physics.isTileBlocking(q.data.x, q.data.y))) {
						q = this.dequeue();
						maxDistance++;
					}
					sprintChance -= 100;
				} while (sprintChance > 0 && this.actionQueue.length > 0);
			}
			q.maxDistance = maxDistance;
			let success = this.performMove(q);
			if (!success) 
				this.clearQueue();
		} else if (q.action === 'spell') {
			let success = this.spellbook.cast(q.data);
			if (!success)
				this.performQueue();
		}
	},

	performMove: function (action) {
		const { x: xOld, y: yOld, syncer, aggro, instance: { physics } } = this;

		const { maxDistance = 1, force, data } = action;
		const { x: xNew, y: yNew } = data;

		if (!force) {
			if (physics.isTileBlocking(data.x, data.y))
				return true;

			data.success = true;
			this.fireEvent('beforeMove', data);
			if (data.success === false) {
				action.priority = true;
				this.queue(action);
				return true;
			}

			let deltaX = Math.abs(xOld - xNew);
			let deltaY = Math.abs(yOld - yNew);
			if (
				(
					(deltaX > maxDistance) ||
					(deltaY > maxDistance)
				) ||
				(
					(deltaX === 0) &&
					(deltaY === 0)
				)
			) 
				return false;
		}

		this.x = xNew;
		this.y = yNew;

		if (physics.addObject(this, xNew, yNew, xOld, yOld))
			physics.removeObject(this, xOld, yOld, xNew, yNew);
		else {
			this.x = xOld;
			this.y = yOld;

			return false;
		}

		//We can't use xNew and yNew because addObject could have changed the position (like entering a building interior with stairs)
		syncer.o.x = this.x;
		syncer.o.y = this.y;

		if (aggro)
			aggro.move();

		this.fireEvent('afterMove');

		return true;
	},

	collisionEnter: function (obj) {
		let cpns = this.components;
		let cLen = cpns.length;
		for (let i = 0; i < cLen; i++) {
			let c = cpns[i];
			if (c.collisionEnter) {
				if (c.collisionEnter(obj))
					return true;
			}
		}
	},

	collisionExit: function (obj) {
		let cpns = this.components;
		let cLen = cpns.length;
		for (let i = 0; i < cLen; i++) {
			let c = cpns[i];
			if (c.collisionExit)
				c.collisionExit(obj);
		}
	},

	onEvent: function (eventName, callback) {
		const entry = {
			eventName,
			callback
		};

		this.eventListeners.push(entry);

		return this.offEvent.bind(this, entry);
	},

	offEvent: function (entry) {
		this.eventListeners.spliceWhere(e => e === entry);
	},

	fireEvent: function (event) {
		let args = [].slice.call(arguments, 1);

		let cpns = this.components;
		let cLen = cpns.length;
		for (let i = 0; i < cLen; i++) {
			let cpn = cpns[i];

			if (cpn.fireEvent)
				cpn.fireEvent(event, args);

			let events = cpn.events;
			if (!events)
				continue;

			let callback = events[event];
			if (!callback)
				continue;

			callback.apply(cpn, args);
		}

		this.eventListeners.forEach(l => {
			const { eventName, callback } = l;
			if (eventName !== event)
				return;

			callback.apply(null, args);
		});
	},

	destroy: function () {
		let cpns = this.components;
		let len = cpns.length;
		for (let i = 0; i < len; i++) {
			let c = cpns[i];
			if (c.destroy)
				c.destroy();
		}
	},

	toString: function () {
		let res = {};

		for (let p in this) {
			if (['components', 'syncer'].includes(p))
				continue;

			let val = this[p];
			
			let stringVal = (val && val.toString) ? val.toString() : val;
			const type = typeof(val);

			if (
				type !== 'function' && 
				(
					type !== 'object' ||
					val.type
				)
			) 
				res[p] = stringVal;
		}

		return JSON.stringify(res, null, 4).split('"').join('') + '\r\n';
	}
};
