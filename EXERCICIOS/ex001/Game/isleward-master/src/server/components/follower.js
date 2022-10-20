module.exports = {
	type: 'follower',

	master: null,

	lifetime: -1,
	maxDistance: 10,

	alwaysFollowMaster: false,

	lastMasterPos: {
		x: 0,
		y: 0
	},

	noNeedMaster: false,

	fGetHighest: {
		inCombat: null,
		outOfCombat: null
	},

	bindEvents: function () {
		let master = this.master;
		this.lastMasterPos.x = master.x;
		this.lastMasterPos.y = master.y;

		this.obj.aggro.faction = master.aggro.faction;
		this.fGetHighest.inCombat = master.aggro.getHighest.bind(master.aggro);
		this.fGetHighest.outOfCombat = this.returnNoAggro.bind(this);
	},

	returnNoAggro: function () {
		let master = this.master;
		let obj = this.obj;
		let mob = obj.mob;

		mob.originX = master.x;
		mob.originY = master.y;

		return null;
	},

	despawn: function () {
		let obj = this.obj;

		obj.destroyed = true;
		this.obj.instance.syncer.queue('onGetObject', {
			x: obj.x,
			y: obj.y,
			components: [{
				type: 'attackAnimation',
				row: 0,
				col: 4
			}]
		}, -1);
	},

	teleport: function () {
		let obj = this.obj;
		let physics = obj.instance.physics;
		let syncer = obj.syncer;
		let master = this.master;

		let newPosition = physics.getOpenCellInArea(master.x - 1, master.y - 1, master.x + 1, master.y + 1);
		if (!newPosition)
			return;

		physics.removeObject(obj, obj.x, obj.y);

		obj.x = newPosition.x;
		obj.y = newPosition.y;

		syncer.o.x = obj.x;
		syncer.o.y = obj.y;

		physics.addObject(obj, obj.x, obj.y);

		obj.instance.syncer.queue('onGetObject', {
			x: obj.x,
			y: obj.y,
			components: [{
				type: 'attackAnimation',
				row: 0,
				col: 4
			}]
		}, -1);
	},

	followMaster: function (distance) {
		const { obj, maxDistance, master: { x, y }, lastMasterPos: { x: lx, y: ly } } = this;

		if (distance < maxDistance)
			return;

		const masterDistanceFromLastPos = Math.max(Math.abs(x - lx), Math.abs(y - ly));
		if (masterDistanceFromLastPos <= maxDistance)
			return;
		
		obj.mob.goHome = true;
		obj.mob.originX = x;
		obj.mob.originY = y;

		this.lastMasterPos.x = x;
		this.lastMasterPos.y = y;
	},

	update: function () {
		if (this.lifetime > 0) {
			this.lifetime--;
			if (this.lifetime === 0) {
				this.despawn();
				return;
			}
		}

		let obj = this.obj;
		let master = this.master;

		if (master.destroyed && !this.noNeedMaster) {
			this.despawn();
			return;
		}

		let attacker = null;
		let maxDistance = this.maxDistance;
		let distance = Math.max(Math.abs(obj.x - master.x), Math.abs(obj.y - master.y));

		if (this.alwaysFollowMaster) {
			this.followMaster(distance);

			return;
		}

		if (obj.aggro)
			attacker = this.fGetHighest.inCombat();

		//When we're too far, just teleport
		if (!attacker && distance >= maxDistance * 2) {
			this.teleport();
			return;
		}

		let doMove = false;
		//If we're not too far from the master but the master is not in combat, move anyway
		if (!attacker) {
			let lastMasterPos = this.lastMasterPos;

			if ((master.x !== lastMasterPos.x) || (master.y !== lastMasterPos.y)) {
				doMove = true;
				lastMasterPos.x = master.x;
				lastMasterPos.y = master.y;
			}
		}

		if (doMove) {
			obj.clearQueue();
			obj.mob.target = obj;
		}

		if (obj.aggro)
			obj.aggro.getHighest = doMove ? this.fGetHighest.outOfCombat : this.fGetHighest.inCombat;
		else
			this.returnNoAggro();
	},

	simplify: function () {
		return {
			type: 'follower',
			master: this.master.id
		};
	}
};
