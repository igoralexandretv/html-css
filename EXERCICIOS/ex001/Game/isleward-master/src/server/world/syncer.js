const { viewDistanceX, viewDistanceY } = consts;

module.exports = {
	buffer: {},
	dirty: false,

	init: function (msg) {
		this.objects = msg.objects;
	},

	update: function () {
		let objects = this.objects;

		let oList = objects.objects;
		let oLen = oList.length;

		let pList = oList.filter(f => f.player && !f.destroyed);
		let pLen = pList.length;

		if (pLen === 0)
			this.updateZoneEmpty(objects, oList, oLen);
		else if (pLen > 0)
			this.updateZoneNotEmpty(objects, oList, oLen, pList, pLen);

		oLen = oList.length;

		for (let i = 0; i < oList.length; i++) 
			oList[i].syncer.reset();
	},

	updateZoneEmpty: function (objects, oList, oLen) {
		for (let i = 0; i < oLen; i++) {
			let o = oList[i];
			if (!o.destroyed) 
				continue;

			objects.removeObject(o);

			oLen--;
			i--;
		}

		this.sendServerModuleMessages();
	},

	updateZoneNotEmpty: function (objects, oList, oLen, pList, pLen) {
		let queueFunction = this.queue.bind(this, 'onGetObject');

		let cache = {};

		for (let i = 0; i < oLen; i++) {
			let o = oList[i];
			let canBeSeenBy = o.canBeSeenBy;
			let oId = o.id;
			let ox = o.x;
			let oy = o.y;

			if (!o.syncer)
				continue;

			let destroyed = o.destroyed;

			let sync = null;
			let syncSelf = null;
			if (!destroyed) {
				sync = o.syncer.get();
				syncSelf = o.syncer.get(true);
				o.syncer.locked = true;
			} else {
				sync = {
					id: o.id,
					destroyed: true,
					destructionEvent: o.destructionEvent
				};

				objects.removeObject(o);

				oLen--;
				i--;
			}

			let toList = [];
			let completeList = [];
			let completeObj = null;

			let sendTo = false;
			let sendComplete = false;

			for (let j = 0; j < pLen; j++) {
				let p = pList[j];
				let px = p.x;
				let py = p.y;

				const canSee = (
					Math.abs(ox - px) <= viewDistanceX && Math.abs(oy - py) < viewDistanceY &&
					(
						!canBeSeenBy ||
						canBeSeenBy === p.name
					)
				);

				let hasSeen = p.player.hasSeen(oId);

				if (hasSeen) {
					if (canSee) {
						if (p.id === oId && syncSelf)
							queueFunction(syncSelf, [ p.serverId ]);

						if (sync) {
							toList.push(p.serverId);
							sendTo = true;
						}
					}

					if (destroyed || !canSee) {
						if (!canSee) {
							queueFunction({
								id: oId,
								destroyed: true,
								destructionEvent: 'visibility'
							},
							[ p.serverId ]);
						}

						p.player.unsee(oId);
					}
				} else if (!destroyed && canSee) {
					let cached = null;
					if (p.id === oId) {
						let syncO = o.getSimple(true);
						syncO.self = true;
						queueFunction(syncO, [ p.serverId ]);
						p.player.see(oId);
						continue;
					} else {
						cached = cache[oId];
						if (!cached)
							cached = cache[oId] = o.getSimple();
					}

					completeObj = cached;
					completeList.push(p.serverId);
					sendComplete = true;

					p.player.see(oId);
				}
			}

			if (sendTo)
				queueFunction(sync, toList);
			if (sendComplete) 
				queueFunction(completeObj, completeList);
		}

		this.send();
	},

	queue: function (event, obj, to) {
		//Send to all players in zone?
		if (to === -1) {
			let pList = this.objects.objects.filter(o => o.player);
			to = pList.map(p => p.serverId);
		}
		if (!to.length)
			return;

		this.dirty = true;

		let buffer = this.buffer;
		let list = buffer[event] || (buffer[event] = []);

		list.push({
			to: to,
			obj: obj
		});
	},

	flushForTarget: function (targetServerId) {
		const buffer = this.buffer;

		for (let p in buffer) {
			const list = buffer[p];

			list.forEach(l => l.to.spliceWhere(f => f === targetServerId));
			list.spliceWhere(l => !l.to.length);

			if (!list.length)
				delete buffer[p];
		}
	},

	processDestroyedObject: function (obj) {
		const { objects, queue } = this;
		const { id, serverId } = obj;

		obj.destroyed = true;

		//We mark forceDestroy to tell objects that we're destroying an object outside of the
		// syncer's update method
		obj.forceDestroy = true;

		const msg = {
			id: id,
			destroyed: true
		};

		objects.removeObject(obj);

		this.flushForTarget(serverId);

		const fnQueueMsg = queue.bind(this, 'onGetObject');

		//Find any players that have seen this obj
		objects
			.filter(o => !o.destroyed && o?.player?.hasSeen(id))
			.forEach(o => {
				fnQueueMsg(msg, [o.serverId]);
			});
	},

	send: function () {
		if (!this.dirty)
			return;

		this.dirty = false;

		process.send({
			method: 'events',
			data: this.buffer
		});

		this.buffer = {};
	},

	sendServerModuleMessages: function () {
		if (!this.dirty)
			return;

		this.dirty = false;

		const serverModuleMsgs = this.buffer.serverModule;

		if (serverModuleMsgs) {
			process.send({
				method: 'events',
				data: {
					serverModule: serverModuleMsgs
				}
			});
		}

		this.buffer = {};
	}
};
