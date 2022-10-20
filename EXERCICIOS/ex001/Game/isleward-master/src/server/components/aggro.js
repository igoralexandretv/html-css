const configThreatCeiling = {
	regular: 1,
	rare: 0.5
};

module.exports = {
	type: 'aggro',

	range: 7,
	cascadeRange: 5,
	faction: null,

	physics: null,

	list: [],
	ignoreList: [],

	threatDecay: 0.9,
	threatCeiling: 1,

	//Certain summoned minions need to despawn when they lose their last target
	dieOnAggroClear: false,

	init: function (blueprint) {
		this.physics = this.obj.instance.physics;

		blueprint = blueprint || {};

		if (blueprint.faction) 
			this.faction = blueprint.faction;

		//TODO: Why don't we move if faction is null?
		if (!this.has('faction'))
			return;

		if (this.physics.width > 0)
			this.move();
	},

	calcThreatCeiling: function (mobType) {
		this.threatCeiling = configThreatCeiling[mobType];
	},

	events: {
		beforeRezone: function () {
			this.die();
		}
	},

	simplify: function (self) {
		return {
			type: 'aggro',
			faction: this.faction
		};
	},

	//If we send through a proxy, we know it's for cascading threat
	move: function (proxy) {
		let obj = proxy || this.obj;
		let aggro = obj.aggro;

		if (obj.dead)
			return;

		let result = {
			success: true
		};
		obj.fireEvent('beforeAggro', result);
		if (!result.success)
			return;

		//If we're attacking something, don't try and look for more trouble. SAVE THE CPU!
		// this only counts for mobs, players can have multiple attackers
		let list = aggro.list;
		if (obj.mob) {
			let lLen = list.length;
			for (let i = 0; i < lLen; i++) {
				let l = list[i];

				let lThreat = l.obj.aggro.getHighest();
				if (lThreat) {
					l.obj.aggro.list.forEach(function (a) {
						a.obj.aggro.unIgnore(lThreat);
					});
				}

				l.obj.aggro.unIgnore(obj);
				if (l.threat > 0)
					return;
			}
		} else {
			let lLen = list.length;
			for (let i = 0; i < lLen; i++) {
				let targetAggro = list[i].obj.aggro;
				//Maybe the aggro component has been removed?
				if (targetAggro)
					targetAggro.unIgnore(obj);
			}
		}

		let x = this.obj.x;
		let y = this.obj.y;

		//Find mobs in range
		let range = proxy ? aggro.cascadeRange : aggro.range;
		let inRange = this.physics.getArea(x - range, y - range, x + range, y + range, c => (
			c.aggro && 
			!c.dead && 
			(
				!c.player || 
				!obj.player
			) && 
			c.aggro.willAutoAttack(obj) &&
			!list.some(l => l.obj === c)
		));

		if (!inRange.length)
			return;

		let iLen = inRange.length;
		for (let i = 0; i < iLen; i++) {
			let enemy = inRange[i];

			if (!this.physics.hasLos(x, y, enemy.x, enemy.y))
				continue;
			else if (enemy.aggro.tryEngage(obj))
				aggro.tryEngage(enemy, 0);
		}
	},

	canAttack: function (target) {
		let obj = this.obj;
		if (target === obj)
			return false;
		else if ((target.player) && (obj.player)) {
			let hasButcher = (obj.prophecies.hasProphecy('butcher')) && (target.prophecies.hasProphecy('butcher'));

			if ((!target.social.party) || (!obj.social.party))
				return hasButcher;
			else if (target.social.partyLeaderId !== obj.social.partyLeaderId)
				return hasButcher;
			return false;
		} else if ((target.follower) && (target.follower.master.player) && (obj.player))
			return false;
		else if (obj.player)
			return true;
		else if (target.aggro.faction !== obj.aggro.faction)
			return true;
		else if (!!target.player !== !!obj.player)
			return true;
	},

	willAutoAttack: function (target) {
		if (this.obj === target)
			return false;

		let faction = target.aggro.faction;
		if (!faction || !this.faction)
			return false;

		let rep = this.obj.reputation;
		if (!rep) {
			let targetRep = target.reputation;
			if (!targetRep)
				return false;
			return (targetRep.getTier(this.faction) < 3);
		}

		return (rep.getTier(faction) < 3);
	},

	ignore: function (obj) {
		this.ignoreList.spliceWhere(o => o === obj);
		this.ignoreList.push(obj);
	},

	unIgnore: function (obj) {
		this.ignoreList.spliceWhere(o => o === obj);
	},

	tryEngage: function (source, amount, threatMult) {
		let obj = this.obj;

		//Don't aggro yourself, stupid
		if (source === obj)
			return;

		let result = {
			success: true
		};
		obj.fireEvent('beforeAggro', result);
		if (!result.success)
			return false;

		//Mobs shouldn't aggro players that are too far from their home
		let mob = obj.mob || source.mob;
		if (mob) {
			let notMob = source.mob ? obj : source;
			if (!mob.canChase(notMob))
				return false;
		}

		let oId = source.id;
		let list = this.list;

		amount = (amount || 0);	
		let threat = (amount / obj.stats.values.hpMax) * (threatMult || 1);

		let exists = list.find(l => l.obj.id === oId);
		if (!exists) {
			exists = {
				obj: source,
				damage: 0,
				threat: 0
			};

			list.push(exists);

			//Cascade threat
			if (obj.mob)
				this.move(source);
		}

		exists.damage += amount;
		exists.threat += threat;

		if (exists.threat > this.threatCeiling)
			exists.threat = this.threatCeiling;

		return true;
	},

	getFirstAttacker: function () {
		let first = this.list.find(l => ((l.obj.player) && (l.damage > 0)));
		if (first)
			return first.obj;
		return null;
	},

	die: function () {
		let list = this.list;
		let lLen = list.length;

		for (let i = 0; i < lLen; i++) {
			let l = list[i];
			if (!l) {
				lLen--;
				continue;
			}
			//Maybe the aggro component was removed?
			let targetAggro = l.obj.aggro;
			if (targetAggro) {
				targetAggro.unAggro(this.obj);
				i--;
				lLen--;
			}
		}

		this.list = [];
	},

	unAggro: function (obj, amount) {
		let list = this.list;
		let lLen = list.length;

		for (let i = 0; i < lLen; i++) {
			let l = list[i];

			if (l.obj !== obj)
				continue;

			if (!amount) {
				list.splice(i, 1);
				obj.aggro.unAggro(this.obj);
				break;
			} else {
				l.threat -= amount;
				if (l.threat <= 0) {
					list.splice(i, 1);
					obj.aggro.unAggro(this.obj);
					break;
				}
			}
		}

		if (list.length !== lLen && this.dieOnAggroClear)
			this.obj.destroyed = true;

		this.ignoreList.spliceWhere(o => o === obj);

		//Stuff like cocoons don't have spellbooks
		if (this.obj.spellbook)
			this.obj.spellbook.unregisterCallback(obj.id, true);

		if ((this.list.length === 0) && (this.obj.mob) && (!this.obj.follower))
			this.obj.stats.resetHp();
	},

	sortThreat: function () {
		this.list.sort(function (a, b) {
			return (b.threat - a.threat);
		});
	},

	getHighest: function () {
		if (this.list.length === 0)
			return null;

		let list = this.list;
		let lLen = list.length;

		let highest = null;
		let closest = 99999;

		let thisObj = this.obj;
		let x = thisObj.x;
		let y = thisObj.y;

		for (let i = 0; i < lLen; i++) {
			let l = list[i];
			let obj = l.obj;

			if (this.ignoreList.some(o => o === obj))
				continue;

			if (!highest || l.threat > highest.threat) {
				highest = l;
				closest = Math.max(Math.abs(x - obj.x), Math.abs(y - obj.y));
			} else if (l.threat === highest.threat && l.threat !== 0) {
				//Don't chase a closer target if both targets are at 0 threat because
				// this means that neither of them have attacked the target.
				// This stops people from griefing other players by pulling mobs to them.
				let distance = Math.max(Math.abs(x - obj.x), Math.abs(y - obj.y));
				if (distance < closest) {
					highest = l;
					closest = distance;
				}
			}
		}

		if (highest)
			return highest.obj;
			
		return null;
	},

	getFurthest: function () {
		let furthest = null;
		let distance = 0;

		let list = this.list;
		let lLen = list.length;

		let thisObj = this.obj;
		let x = thisObj.x;
		let y = thisObj.y;

		for (let i = 0; i < lLen; i++) {
			let l = list[i];
			let obj = l.obj;

			if (this.ignoreList.some(o => o === obj))
				continue;

			let oDistance = Math.max(Math.abs(x - obj.x), Math.abs(y - obj.y));
			if (oDistance > distance) {
				furthest = l;
				distance = oDistance;
			}
		}

		return furthest.obj;
	},

	getRandom: function () {
		let useList = this.list.filter(l => (!this.ignoreList.some(o => (o === l.obj))));
		return useList[~~(Math.random() * useList.length)];
	},

	hasAggroOn: function (obj) {
		return (
			this.list.find(l => l.obj === obj) &&
			!this.ignoreList.find(l => l === obj)
		);
	},

	update: function () {
		let list = this.list;
		let lLen = list.length;

		for (let i = 0; i < lLen; i++) {
			let l = list[i];

			if (l.obj.destroyed) {
				this.unAggro(l.obj);
				i--;
				lLen--;
			} else if (l.threat > 0)
				l.threat *= this.threatDecay;
		}
	},

	clearIgnoreList: function () {
		this.ignoreList = [];
	},

	isInCombat: function () {
		return this.list.length > 0;
	}
};
