let factionBase = require('../config/factionBase');
let factions = require('../config/factions');

module.exports = {
	type: 'reputation',

	list: [],

	factions: {},

	init: function (blueprint) {
		let list = ((blueprint || {}).list || []);
		delete blueprint.list;

		list.forEach(function (l) {
			let bpt = this.getBlueprint(l.id);
			if (!bpt)
				return;

			this.list.push({
				id: l.id,
				rep: l.rep,
				tier: null
			});

			this.calculateTier(l.id);
		}, this);
	},

	getBlueprint: function (factionId) {
		if (this.factions[factionId])
			return this.factions[factionId];

		let factionBlueprint = null;
		try {
			factionBlueprint = factions.getFaction(factionId);
		} catch (e) {}

		if (!factionBlueprint)
			return;

		factionBlueprint = extend({}, factionBase, factionBlueprint);

		this.factions[factionBlueprint.id] = factionBlueprint;

		return factionBlueprint;
	},

	getTier: function (factionId) {
		let faction = this.list.find(l => l.id === factionId);
		if (!faction) {
			this.discoverFaction(factionId);
			faction = this.list.find(l => l.id === factionId);
		}

		return (faction || {
			tier: 3
		}).tier;
	},

	canEquipItem: function (item) {
		let itemFactions = item.factions;
		let fLen = itemFactions.length;
		for (let i = 0; i < fLen; i++) {
			let f = itemFactions[i];
			if (this.getTier(f.id) < f.tier)
				return false;
		}

		return true;
	},

	calculateTier: function (factionId) {
		let blueprint = this.getBlueprint(factionId);

		let faction = this.list.find(l => l.id === factionId);
		let rep = faction.rep;

		let tier = 0;
		let tiers = blueprint.tiers;
		let tLen = tiers.length;
		for (let i = 0; i < tLen; i++) {
			let t = tiers[i];
			tier = i - 1;

			if (t.rep > rep)
				break;
			else if (i === tLen - 1)
				tier = i;
		}

		if (tier < 0)
			tier = 0;

		faction.tier = tier;

		return tier;
	},

	getReputation: function (factionId, gain) {
		let fullSync = false;
		let blueprint = this.getBlueprint(factionId);

		let faction = this.list.find(l => l.id === factionId);
		if (!faction) {
			fullSync = true;
			this.list.push({
				id: factionId,
				rep: blueprint.initialRep,
				tier: null
			});

			faction = this.list[this.list.length - 1];
		}

		faction.rep += gain;
		let oldTier = faction.tier;
		this.calculateTier(factionId);

		let action = 'gained';
		if (gain < 0)
			action = 'lost';

		this.obj.social.notifySelf({
			className: (action === 'gained') ? 'color-greenB' : 'color-redA',
			message: 'you ' + action + ' ' + Math.abs(gain) + ' reputation with ' + blueprint.name,
			type: 'rep'
		});

		if (faction.tier !== oldTier) {
			this.sendMessage(blueprint.tiers[faction.tier].name, blueprint.name, (faction.tier > oldTier));
			this.obj.equipment.unequipFactionGear(faction.id, faction.tier);
		}

		this.syncFaction(factionId, fullSync);
	},

	sendMessage: function (tierName, factionName, didIncrease) {
		this.obj.social.notifySelf({
			className: didIncrease ? 'color-greenB' : 'color-redA',
			message: 'you are now ' + tierName + ' with ' + factionName,
			type: 'rep'
		});
	},

	discoverFaction (factionId) {
		if (this.list.some(l => l.id === factionId))
			return;

		let blueprint = this.getBlueprint(factionId);

		if (!blueprint)
			return;

		this.list.push({
			id: factionId,
			rep: blueprint.initialRep,
			tier: null
		});

		let tier = blueprint.tiers[this.calculateTier(factionId)].name.toLowerCase();

		if (!blueprint.noGainRep) {
			this.obj.social.notifySelf({
				className: 'q4',
				message: 'you are now ' + tier + ' with ' + blueprint.name,
				type: 'rep'
			});
		}

		this.syncFaction(factionId, true);
	},

	save: function () {
		return {
			type: 'reputation',
			list: this.list
		};
	},

	simplify: function (self) {
		if (!self)
			return null;

		let sendList = this.list
			.map(function (l) {
				let result = {};
				let blueprint = this.getBlueprint(l.id);
				extend(result, l, blueprint);

				return result;
			}, this);

		return {
			type: 'reputation',
			list: sendList
		};
	},

	syncFaction: function (factionId, full) {
		let l = this.list.find(f => (f.id === factionId));
		let faction = {
			id: factionId,
			rep: l.rep,
			tier: l.tier
		};

		if (full) {
			let blueprint = this.getBlueprint(factionId);
			extend(faction, l, blueprint);
		}

		this.obj.syncer.setArray(true, 'reputation', 'modifyRep', faction);
	},

	events: {
		afterKillMob: function (mob) {
			if (!mob.mob)
				return;

			let grantRep = mob.mob.grantRep;
			if (!grantRep) {
				let deathRep = mob.mob.deathRep;
				if (deathRep)
					this.getReputation(mob.aggro.faction, deathRep);
				return;
			}

			for (let r in grantRep) 
				this.getReputation(r, grantRep[r]);
		}
	}
};
