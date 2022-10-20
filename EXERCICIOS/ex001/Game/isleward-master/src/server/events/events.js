let phaseTemplate = require('./phases/phaseTemplate');
let fs = require('fs');
let mapList = require('../config/maps/mapList');

const applyVariablesToDescription = (desc, variables) => {
	if (!variables)
		return desc;

	Object.entries(variables).forEach(e => {
		const [key, value] = e;
		desc = desc.split(`$${key}$`).join(value);
	});

	return desc;
};

module.exports = {
	configs: [],
	nextId: 0,

	init: function (instance) {
		this.instance = instance;

		const zoneName = this.instance.map.name;
		const zonePath = mapList.mapList.find(z => z.name === zoneName).path;
		const zoneEventPath = zonePath + '/' + zoneName + '/events';

		const paths = ['config/globalEvents', zoneEventPath];
		const files = [];
		paths.forEach(p => {
			if (!fs.existsSync(p))
				return;

			files.push(...fs.readdirSync(p).map(f => ('../' + p + '/' + f)));
		});

		this.instance.eventEmitter.emit('onBeforeGetEventList', zoneName, files);

		files.forEach(f => {
			if (!f.includes('.js'))
				return;

			const e = require(f);
			if (!e.disabled)
				this.configs.push(extend({}, e));
		}, this);
	},

	getEvent: function (name) {
		return this.configs.find(c => (c.name === name)).event.config;
	},

	setEventDescription: function (name, desc) {
		let config = this.getEvent(name);
		let event = config.event;
		if (!event)
			return;

		if (!config.oldDescription)
			config.oldDescription = config.description;

		if ((config.events) && (config.events.beforeSetDescription))
			config.events.beforeSetDescription(this);

		if (desc) {
			desc = applyVariablesToDescription(desc, event.variables);

			config.description = desc;
		}

		event.participators.forEach(p => p.events.syncList());
	},

	setEventRewards: function (name, rewards) {
		let config = this.getEvent(name);
		let event = config.event;
		if (!event)
			return;

		event.rewards = rewards;
		event.age = event.config.duration - 2;
	},

	setParticipantRewards: function (eventName, participantName, newRewards) {
		const { event: { rewards } } = this.getEvent(eventName);

		rewards[participantName] = newRewards;
	},

	addParticipantRewards: function (eventName, participantName, addRewards) {
		const { event: { rewards } } = this.getEvent(eventName);

		let pRewards = rewards[participantName];
		if (!pRewards) {
			pRewards = [];
			rewards[participantName] = pRewards;
		}

		if (!addRewards.push)
			addRewards = [ addRewards ];

		addRewards.forEach(r => {
			const { name, quantity = 1 } = r;

			const exists = pRewards.find(f => f.name === name);
			if (exists)
				exists.quantity = (exists.quantity || 1) + quantity;
			else
				pRewards.push(r);
		});
	},

	setWinText: function (name, text) {
		let config = this.getEvent(name);
		let event = config.event;
		if (!event)
			return;

		event.winText = text;
	},

	setEventVariable: function (eventName, variableName, value) {
		let config = this.getEvent(eventName);
		let event = config.event;
		if (!event)
			return;

		event.variables[variableName] = value;
	},

	incrementEventVariable: function (eventName, variableName, delta) {
		let config = this.getEvent(eventName);
		let event = config.event;
		if (!event)
			return;

		const currentValue = event.variables[variableName] || 0;
		event.variables[variableName] = currentValue + delta;
	},

	update: function () {
		let configs = this.configs;
		if (!configs)
			return;

		let scheduler = this.instance.scheduler;

		let cLen = configs.length;
		for (let i = 0; i < cLen; i++) {
			let c = configs[i];

			if (c.event) {
				this.updateEvent(c.event);

				const shouldStop = (
					c.event.done ||
					(
						c.cron &&
						c.durationEvent &&
						!scheduler.isActive(c)
					)
				);

				if (shouldStop)
					this.stopEvent(c);

				continue;
			} else if ((c.ttl) && (c.ttl > 0)) {
				c.ttl--;
				continue;
			} else if (c.cron) {
				if (c.durationEvent && !scheduler.isActive(c))
					continue;
				else if (!c.durationEvent && !scheduler.shouldRun(c))
					continue;
			} else if (c.manualTrigger)
				continue;

			c.event = this.startEvent(c);
			this.updateEvent(c.event);
		}
	},

	startEvent: function (config) {
		if (config.oldDescription)
			config.description = config.oldDescription;

		const event = {
			id: this.nextId++,
			config: extend({}, config),
			eventManager: this,
			variables: {},
			rewards: {},
			phases: [],
			participators: [],
			objects: [],
			nextPhase: 0,
			age: 0
		};
		event.config.event = event;

		const onStart = _.getDeepProperty(event, ['config', 'events', 'onStart']);
		if (onStart)
			onStart(this, event);

		return event;
	},

	startEventByCode: function (eventCode) {
		const config = this.configs.find(c => c.code === eventCode);
		if (!config || config.event)
			return;

		config.event = this.startEvent(config);
		this.updateEvent(config.event);

		this.instance.syncer.queue('onGetMessages', {
			messages: {
				class: 'color-pinkA',
				message: `The ${config.name} event has begun!`
			}
		}, -1);
	},

	stopEventByCode: function (eventCode) {
		const config = this.configs.find(c => c.code === eventCode);
		if (!config || !config.event)
			return;

		this.stopEvent(config);

		this.instance.syncer.queue('onGetMessages', {
			messages: {
				class: 'color-pinkA',
				message: `The ${config.name} event has come to an end!`
			}
		}, -1);
	},

	giveRewards: function (config) {
		const { event: { rewards = {} } } = config;

		const subject = `${config.name} Rewards`;
		const senderName = config.rewardSenderName;

		Object.entries(rewards).forEach(e => {
			const [ name, rList ] = e;

			if (!rList || !rList.length)
				return;

			//Hack: Mail is a mod. As such, events should be a mod that depends on mail
			if (global.mailManager) {
				global.mailManager.sendSystemMail({
					to: name,
					from: senderName,
					subject,
					msg: '',
					items: rList,
					notify: true
				});
			}
		});

		if ((config.events) && (config.events.afterGiveRewards))
			config.events.afterGiveRewards(this, config);
	},

	stopAll: function () {
		this.configs.forEach(c => {
			if (c.event)
				c.event.done = true;
		});
	},

	stopEvent: function (config) {
		let event = config.event;

		config.event.participators.forEach(function (p) {
			p.events.unregisterEvent(event);
		}, this);

		config.event.objects.forEach(function (o) {
			o.destroyed = true;

			this.instance.syncer.queue('onGetObject', {
				x: o.x,
				y: o.y,
				components: [{
					type: 'attackAnimation',
					row: 0,
					col: 4
				}]
			}, -1);
		}, this);

		if (event.winText) {
			this.instance.syncer.queue('serverModule', {
				module: 'cons',
				method: 'emit',
				msg: [
					'event',
					{
						event: 'onGetMessages',
						data: {
							messages: {
								class: 'color-pinkA',
								message: event.winText
							}
						}
					}
				]
			}, ['server']);
		}

		event.phases.forEach(function (p) {
			if ((p.destroy) && (!p.destroyed)) {
				p.destroyed = true;
				p.destroy();
			}
		});

		const onStop = _.getDeepProperty(event, ['config', 'events', 'onStop']);
		if (onStop)
			onStop(this, event);

		delete config.event;
	},

	handleNotification: function (event, { msg, desc, event: triggerEvent }) {
		if (msg) {
			this.instance.syncer.queue('serverModule', {
				module: 'cons',
				method: 'emit',
				msg: [
					'event',
					{
						event: 'onGetMessages',
						data: {
							messages: {
								class: 'color-pinkA',
								message: msg
							}
						}
					}
				]
			}, ['server']);
		}

		if (desc) {
			event.config.descTimer = desc;
			this.setEventDescription(event.config.name);
		}

		if (triggerEvent && event.config.events[triggerEvent])
			event.config.events[triggerEvent](this, event);
	},

	updateEvent: function (event) {
		const onTick = _.getDeepProperty(event, ['config', 'events', 'onTick']);
		if (onTick)
			onTick(this, event);

		let objects = event.objects;
		let oLen = objects.length;
		for (let i = 0; i < oLen; i++) {
			if (objects[i].destroyed) {
				objects.splice(i, 1);
				i--;
				oLen--;
			}
		}

		let currentPhases = event.phases;
		let cLen = currentPhases.length;
		let stillBusy = false;
		for (let i = 0; i < cLen; i++) {
			let phase = currentPhases[i];
			if (!phase.destroyed) {
				if (phase.end || (phase.endMark !== -1 && phase.endMark <= event.age)) {
					if ((phase.destroy) && (!phase.destroyed))
						phase.destroy();
					phase.destroyed = true;
					continue;
				} else {
					if (phase.has('ttl')) { 
						if (phase.ttl === 0) {
							phase.end = true;
							continue;
						}

						phase.ttl--;
						stillBusy = true;
					} else if (!phase.auto)
						stillBusy = true;

					phase.update(event);
				}
			}
		}

		const notifications = event.config.notifications || [];
		notifications.forEach(n => {
			if (n.mark === event.age)
				this.handleNotification(event, n);
		});

		event.age++;

		if (event.age === event.config.duration) 
			event.done = true;
		
		else if ((event.config.prizeTime) && (event.age === event.config.prizeTime)) 
			this.giveRewards(event.config);

		if (stillBusy)
			return;

		let config = event.config;

		let phases = config.phases;
		let pLen = phases.length;
		for (let i = event.nextPhase; i < pLen; i++) {
			let p = phases[i];

			let phase = event.phases[i];
			if (!phase) {
				let phaseFile = 'phase' + p.type[0].toUpperCase() + p.type.substr(1);
				let typeTemplate = require('./phases/' + phaseFile);
				phase = extend({
					instance: this.instance,
					event: event
				}, phaseTemplate, typeTemplate, p);

				event.phases.push(phase);
				event.currentPhase = phase;
			}

			event.nextPhase = i + 1;
			phase.init(event);

			if (!p.auto) {
				stillBusy = true;
				break;
			}
		}

		if ((event.nextPhase >= pLen) && (!stillBusy))
			event.done = true;

		let oList = this.instance.objects.objects;
		oLen = oList.length;
		for (let i = 0; i < oLen; i++) {
			let o = oList[i];
			if (!o.player)
				continue;

			o.events.events.afterMove.call(o.events);
		}
	},

	getCloseEvents: function (obj) {
		let x = obj.x;
		let y = obj.y;

		let configs = this.configs;
		if (!configs)
			return;

		let cLen = configs.length;
		let result = [];
		for (let i = 0; i < cLen; i++) {
			let event = configs[i].event;
			if (!event)
				continue;

			let exists = event.participators.find(p => (p.name === obj.name));
			if (exists) {
				event.participators.spliceWhere(p => (p === exists));
				event.participators.push(obj);
				result.push(event);
				continue;
			}

			let distance = event.config.distance;
			if (distance === -1) {
				event.participators.push(obj);
				result.push(event);

				if (event.config.events && event.config.events.onParticipantJoin)
					event.config.events.onParticipantJoin(this, obj);

				continue;
			}

			let objects = event.objects;
			let oLen = objects.length;
			for (let j = 0; j < oLen; j++) {
				let o = objects[j];

				if (
					(distance === -1) ||
					(!distance) ||
					(
						(Math.abs(x - o.x) < distance) &&
						(Math.abs(y - o.y) < distance)
					)
				) {
					event.participators.push(obj);
					result.push(event);

					if (event.config.events && event.config.events.onParticipantJoin)
						event.config.events.onParticipantJoin(this, obj);

					break;
				}
			}
		}

		return result;
	}
};
