let objBase = require('./objBase');

module.exports = {
	lastId: 0,
	instance: null,

	objects: [],

	init: function (_instance) {
		this.instance = _instance;
		this.physics = this.instance.physics;
	},

	getNextId: function () {
		return ++this.lastId;
	},

	build: function (isClientObj, id) {
		let o = extend({}, objBase);

		if (isClientObj)
			o.update = null;
		else {
			o.id = id || this.getNextId();
			o.addComponent('syncer');
			o.instance = this.instance;
		}

		return o;
	},

	pushObjectToList: function (obj) {
		this.objects.push(obj);
	},

	transferObject: function (o) {
		const obj = this.build();

		let components = o.components;
		delete o.components;
		delete o.id;

		for (let p in o) 
			obj[p] = o[p];

		const cLen = components.length;
		for (let i = 0; i < cLen; i++) {
			let c = components[i];

			const cpn = obj.addComponent(c.type, null, true);

			for (let p in c) 
				cpn[p] = c[p];

			if (cpn.transfer)
				cpn.transfer();
		}

		this.pushObjectToList(obj);
		this.physics.addObject(obj, obj.x, obj.y);

		return obj;
	},

	buildObjects: function (list, skipPush) {
		let lLen = list.length;
		for (let i = 0; i < lLen; i++) {
			let l = list[i];

			let obj = this.build(l.clientObj, l.id);

			obj.sheetName = l.sheetName;
			obj.cell = l.cell;
			obj.name = l.name;

			obj.x = l.x;
			obj.y = l.y;

			if (l.ttl)
				obj.ttl = l.ttl;

			if (l.width) {
				obj.width = l.width;
				obj.height = l.height;
			}

			if (l.area)
				obj.area = l.area;

			//Add components (certain ones need to happen first)
			//TODO: Clean this part up
			let properties = extend({}, l.properties);
			['cpnMob'].forEach(function (c) {
				let blueprint = properties[c] || null;
				if ((blueprint) && (typeof (blueprint) === 'string'))
					blueprint = JSON.parse(blueprint);

				if (!blueprint)
					return;

				delete properties[c];

				let type = c.replace('cpn', '').toLowerCase();

				obj.addComponent(type, blueprint);
			}, this);

			for (let p in properties) {
				if (p.indexOf('cpn') === -1) {
					obj[p] = properties[p];
					continue;
				}

				let type = p.replace('cpn', '');
				type = type[0].toLowerCase() + type.substr(1);
				let blueprint = properties[p] || null;
				if ((blueprint) && (typeof (blueprint) === 'string'))
					blueprint = JSON.parse(blueprint);

				obj.addComponent(type, blueprint);
			}

			let extraProperties = l.extraProperties || {};
			for (let p in extraProperties) {
				let cpn = obj[p];
				let e = extraProperties[p];
				for (let pp in e) 
					cpn[pp] = e[pp];
				
				if (cpn.init)
					cpn.init();
			}

			if ((this.physics) && (!obj.dead)) {
				if (!obj.width)
					this.physics.addObject(obj, obj.x, obj.y);
				else
					this.physics.addRegion(obj);
			}

			if (obj.aggro)
				obj.aggro.move();

			if (!skipPush)
				this.pushObjectToList(obj);

			if (lLen === 1)
				return obj;
		}
	},

	find: function (callback) {
		return this.objects.find(callback);
	},

	filter: function (callback) {
		return this.objects.filter(callback);
	},

	removeObject: function (obj, callback, useServerId) {
		let found = this.objects.spliceFirstWhere(o => obj.id === (useServerId ? o.serverId : o.id));
		if (!found)
			return;

		let physics = this.physics;
		if (physics) {
			if (!found.width)
				physics.removeObject(found, found.x, found.y);
			else
				physics.removeRegion(found);
		}

		found.destroy();

		if (callback)
			callback(found);
	},

	addObject: function (o, callback) {
		const newO = this.build();

		const components = o.components;

		delete o.components;

		for (let p in o) 
			newO[p] = o[p];

		const len = components.length;
		for (let i = 0; i < len; i++) {
			const c = components[i];

			const newC = newO.addComponent(c.type, c);
			extend(newC, c);
		}

		this.pushObjectToList(newO);

		if (!newO.dead)
			this.physics.addObject(newO, newO.x, newO.y);

		callback(newO);

		return newO;
	},

	sendEvent: function (msg, { name: sourceZone }) {
		const { id, data } = msg;

		const player = this.objects.find(p => p.id === id);
		if (!player || player.zoneName !== sourceZone)
			return;

		player.socket.emit('event', {
			event: data.event,
			data: data.data
		});
	},

	sendEvents: function ({ data }, { name: sourceZone }) {
		const { objects } = this;

		//Store will contain all events to be sent to players
		const store = {};

		for (let e in data) {
			const event = data[e];
			const eLen = event.length;

			for (let j = 0; j < eLen; j++) {
				const eventEntry = event[j];

				const { obj: eventObj, to } = eventEntry;

				if (e === 'serverModule') {
					const { method, msg } = eventObj;

					if (Array.isArray(msg))
						global[eventObj.module][method](...msg);	
					else
						global[eventObj.module][method](msg);

					continue;
				}

				const toLen = to.length;
				for (let i = 0; i < toLen; i++) {
					const toId = to[i];

					let storeEntry = store[toId];
					if (!storeEntry) {
						const playerObj = objects.find(o => o.id === toId);

						if (!playerObj || playerObj.zoneName !== sourceZone) {
							io.setAsync({
								key: new Date(),
								table: 'error',
								value: `ignoring ${e}`
							});

							continue;
						}

						store[toId] = {
							obj: playerObj,
							events: { [e]: [eventObj] }
						};

						continue;
					}

					if (!storeEntry.events[e])
						storeEntry.events[e] = [];

					storeEntry.events[e].push(eventObj);
				}
			}
		}

		for (let p in store) {
			const { obj: { socket }, events } = store[p];

			socket.emit('events', events);
		}
	},

	updateObject: async function (msg) {
		let player = this.objects.find(p => p.id === msg.serverId);
		if (!player)
			return;

		let obj = msg.obj;
		for (let p in obj) 
			player[p] = obj[p];

		if (obj.permadead)
			await leaderboard.killCharacter(player.name);

		if (obj.level) {
			await leaderboard.setLevel(player.name, obj.level);

			cons.emit('events', {
				onGetMessages: [{
					messages: [{
						class: 'color-blueB',
						message: player.name + ' has reached level ' + obj.level
					}]
				}],
				onGetConnectedPlayer: [cons.getCharacterList()]
			});
		}
	},

	notifyCollisionChange: function (x, y, collides) {
		this.objects
			.filter(o => o.player)
			.forEach(function (o) {
				o.syncer.setArray(true, 'player', 'collisionChanges', {
					x,
					y,
					collides
				});
			});
	},

	notifyMapChange: function (x, y, mapCellString) {
		this.objects
			.filter(o => o.player)
			.forEach(function (o) {
				o.syncer.setArray(true, 'player', 'mapChanges', {
					x,
					y,
					mapCellString
				});
			});
	},

	update: function () {
		let objects = this.objects;
		let len = objects.length;

		for (let i = 0; i < len; i++) {
			let o = objects[i];

			//If object A causes object B (layer in the list) to rezone, we won't find it here
			if (!o) {
				len--;

				continue;
			}

			//Don't remove it from the list if it's destroyed, but don't update it either
			//That's syncer's job
			if ((o.update) && (!o.destroyed))
				o.update();

			//When objects are sent to other zones, we destroy them immediately (thhrough sendObjToZone)
			if (o.forceDestroy) {
				i--;
				len--;
				continue;
			}

			if (o.ttl) {
				o.ttl--;
				if (!o.ttl)
					o.destroyed = true;
			}

			o.fireEvent('afterTick');
		}
	}
};
