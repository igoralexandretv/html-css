let childProcess = require('child_process');
let objects = require('../objects/objects');
let mapList = require('../config/maps/mapList');
let connections = require('../security/connections');
let events = require('../misc/events');

const listenersOnZoneIdle = [];

module.exports = {
	nextId: 0,
	lastCallbackId: 0,
	threads: [],
	callbacks: [],

	init: function () {
		this.getMapFiles();
	},

	addObject: async function (obj, keepPos, transfer) {
		const serverObj = objects.objects.find(o => o.id === obj.id);
		if (!serverObj)
			return;

		events.emit('onBeforePlayerEnterWorld', obj);

		let thread;

		let map = mapList.mapList.find(m => m.name === obj.zoneName);

		if (!map) 
			map = mapList.mapList.find(m => m.name === clientConfig.config.defaultZone);

		thread = this.threads.find(t => t.id === obj.zoneId && t.name === obj.zoneName);

		if (!thread) {
			if (map.instanced) {
				delete obj.x;
				delete obj.y;
				thread = this.spawnMap(map);

				await new Promise(res => setTimeout(res, 2000));
			} else
				thread = this.getThreadFromName(map.name);
		}

		obj.zoneName = thread.name;
		obj.zoneId = thread.id;

		serverObj.zoneId = thread.id;
		serverObj.zoneName = thread.name;

		serverObj.player.broadcastSelf();

		const simpleObj = obj.getSimple ? obj.getSimple(true, true) : obj;

		this.send(obj.zoneId, {
			method: 'addObject',
			args: {
				keepPos: keepPos,
				obj: simpleObj,
				transfer: transfer
			}
		});
	},

	removeObjectFromInstancedZone: async function (thread, obj, callback) {
		await new Promise(res => {
			const cb = this.registerCallback(res);

			thread.worker.send({
				method: 'forceSavePlayer',
				args: {
					playerName: obj.name,
					callbackId: cb
				}
			});
		});

		thread.worker.kill();
		this.threads.spliceWhere(t => t === thread);

		if (callback)
			callback();
	},

	removeObject: function (obj, skipLocal, callback) {
		if (!skipLocal)
			objects.removeObject(obj);

		let thread = this.findObjectThread(obj);
		if (!thread) 
			return;

		if (thread.instanced) {
			this.removeObjectFromInstancedZone(thread, obj, callback);

			return;
		}

		let callbackId = null;
		if (callback)
			callbackId = this.registerCallback(callback);

		this.send(obj.zoneId, {
			method: 'removeObject',
			args: {
				obj: obj.getSimple(true),
				callbackId: callbackId
			}
		});
	},
	updateObject: function (obj, msgObj) {
		this.send(obj.zoneId, {
			method: 'updateObject',
			args: {
				id: obj.id,
				obj: msgObj
			}
		});
	},
	queueAction: function (obj, action) {
		this.send(obj.zoneId, {
			method: 'queueAction',
			args: {
				id: obj.id,
				action: action
			}
		});
	},
	performAction: function (obj, action) {
		this.send(obj.zoneId, {
			method: 'performAction',
			args: {
				id: obj.id,
				action: action
			}
		});
	},

	registerCallback: function (callback) {
		this.callbacks.push({
			id: ++this.lastCallbackId,
			callback: callback
		});

		return this.lastCallbackId;
	},
	resolveCallback: function (msg) {
		let callback = this.callbacks.spliceFirstWhere(c => c.id === msg.msg.id);
		if (!callback)
			return;

		callback.callback(msg.msg.result);
	},

	send: function (threadId, msg) {
		const thread = this.threads.find(t => t.id === threadId);
		if (thread)
			thread.worker.send(msg);
	},

	findObjectThread: function ({ zoneId }) {
		return this.threads.find(t => t.id === zoneId);
	},
	getThreadFromName: function (name) {
		return this.threads.find(t => t.name === name);
	},

	getMapFiles: function () {
		mapList.mapList
			.filter(m => !m.disabled && !m.instanced)
			.forEach(m => this.spawnMap(m));
	},
	spawnMap: function ({ name, path, instanced }) {
		const worker = childProcess.fork('./world/worker', [name]);

		const id = instanced ? _.getGuid() : name;

		const thread = {
			id,
			name,
			instanced,
			path,
			worker
		};

		const onMessage = this.onMessage.bind(this, thread);
		worker.on('message', function (m) {
			onMessage(m);
		});

		this.threads.push(thread);

		return thread;
	},
	onMessage: function (thread, message) {
		if (message.module) {
			try {
				global[message.module][message.method](message);
			} catch (e) {
				/* eslint-disable-next-line no-console */
				console.log('No global method found', message.module, message.method);
				process.exit();
			}
		} else if (message.event === 'onCrashed') {
			thread.worker.kill();
			process.exit();
		} else
			this.thread[message.method].call(this, thread, message);
	},

	messageAllThreads: function (message) {
		this.threads.forEach(t => t.worker.send(message));
	},

	fireEventOnAllThreads: function ({ msg: { event, data } }) {
		this.threads.forEach(t => t.worker.send({ event, data }));
	},

	thread: {
		onReady: function (thread) {
			thread.worker.send({
				method: 'init',
				args: {
					zoneName: thread.name,
					zoneId: thread.id,
					path: thread.path
				}
			});
		},

		event: function (thread, message) {
			objects.sendEvent(message, thread);
		},

		events: function (thread, message) {
			objects.sendEvents(message, thread);
		},

		object: function (thread, message) {
			objects.updateObject(message);
		},

		track: function (thread, message) {
			let player = objects.objects.find(o => o.id === message.serverId);
			if (!player)
				return;

			player.auth.gaTracker.track(message.obj);
		},

		callDifferentThread: function (thread, message) {
			let obj = connections.players.find(p => (p.name === message.playerName));
			if (!obj)
				return;
			let newThread = this.getThreadFromName(obj.zoneName);
			if (!newThread)
				return;

			newThread.worker.send({
				module: message.data.module,
				method: message.data.method,
				args: message.data.args
			});
		},

		rezone: async function (thread, message) {
			const { args: { obj, newZone, keepPos = true } } = message;

			if (thread.instanced) {
				thread.worker.kill();
				this.threads.spliceWhere(t => t === thread);
			}

			//When messages are sent from map threads, they have an id (id of the object in the map thread)
			// as well as a serverId (id of the object in the main thread)
			const serverId = obj.serverId;
			obj.id = serverId;
			obj.destroyed = false;

			const serverObj = objects.objects.find(o => o.id === obj.id);
			const mapExists = mapList.mapList.some(m => m.name === newZone);

			if (mapExists) {
				serverObj.zoneName = newZone;
				obj.zoneName = newZone;
			} else {
				obj.zoneName = clientConfig.config.defaultZone;
				serverObj.zoneName = clientConfig.config.defaultZone;
			}

			delete serverObj.zoneId;
			delete obj.zoneId;

			const isRezone = true;
			await this.addObject(obj, keepPos, isRezone);
		},

		onZoneIdle: function (thread) {
			listenersOnZoneIdle.forEach(l => l(thread));
		}
	},

	returnWhenZonesIdle: async function () {
		return new Promise(res => {
			const waiting = [...this.threads];

			const onZoneIdle = thread => {
				waiting.spliceWhere(w => w === thread);

				if (waiting.length)
					return;

				listenersOnZoneIdle.spliceWhere(l => l === onZoneIdle);
				res();
			};

			listenersOnZoneIdle.push(onZoneIdle);

			this.threads.forEach(t => {
				t.worker.send({
					method: 'notifyOnceIdle'
				});
			});
		});
	},

	forceSavePlayer: async function (playerName, zoneId) {
		const thread = this.threads.find(t => t.id === zoneId);

		if (!thread)
			return;

		return new Promise(res => {
			const callbackId = this.registerCallback(res);

			thread.worker.send({
				method: 'forceSavePlayer',
				args: {
					playerName,
					callbackId
				}
			});
		});
	}

};
