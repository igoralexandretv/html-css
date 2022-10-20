let generator = require('../../items/generator');
let skins = require('../../config/skins');
let factions = require('../../config/factions');

module.exports = {
	baseItems: [],

	cdMax: 5130,

	blueprint: null,

	init: function (blueprint) {
		this.baseItems = this.items;
		this.items = {};

		this.faction = blueprint.faction;
		this.blueprint = blueprint;
	},

	update: function () {
		for (let name in this.items) {
			let list = this.items[name];
			list.cd--;
			if (!list.cd) {
				list.cd = this.cdMax;
				this.regenList(list);
			}
		}
	},

	getItems: function (requestedBy) {
		let name = requestedBy.name;
		let requestLevel = requestedBy.stats.values.level;

		let list = this.items[name];
		if (!list) {
			list = {
				items: [],
				level: requestLevel,
				cd: this.cdMax
			};

			this.items[name] = list;
			this.regenList(list);
		} else if (list.level !== requestLevel) {
			list.level = requestLevel;
			this.regenList(list);
		}

		let result = list.items.map(m => {
			let item = requestedBy.inventory.simplifyItem(m);
			if (item.stats)
				item.stats = { stats: '???' };
			if (item.implicitStats)
				item.implicitStats = [ { stat: 'stats', value: '???' } ];
			delete item.effects;

			return item;
		});

		return result;
	},

	regenList: function (list) {
		let blueprint = this.blueprint;

		list.items = null;
		list.items = [];

		let faction = factions.getFaction(blueprint.faction.id);
		let statGenerator = faction.uniqueStat;

		let itemCount = blueprint.items.min + ~~(Math.random() * (blueprint.items.max - blueprint.items.min));
		for (let i = 0; i < itemCount; i++) {
			let minLevel = blueprint.items.minLevel || Math.max(1, list.level * 0.75);
			let maxLevel = blueprint.items.maxLevel || (list.level * 1.25);
			let level = Math.min(20, ~~(minLevel + (Math.random() * (maxLevel - minLevel))));

			let item = generator.generate({
				noSpell: true,
				magicFind: 150,
				slot: blueprint.items.slot,
				level: level
			});

			let randomQuality = ~~(Math.random() * 5);
			item.worth = Math.pow(item.level, 1.5) + (Math.pow((randomQuality + 1), 2) * 10);

			let id = 0;
			list.items.forEach(function (checkItem) {
				if (checkItem.id >= id)
					id = checkItem.id + 1;
			});

			item.id = id;

			generator.removeStat(item);
			statGenerator.generate(item);

			item.factions = [{}];
			item.factions[0].id = blueprint.faction.id;
			item.factions[0].tier = blueprint.faction.tier;

			list.items.push(item);
		}

		let baseItems = this.baseItems;
		let bLen = baseItems.length;
		for (let i = 0; i < bLen; i++) 
			list.items.push(baseItems[i]);

		let extra = blueprint.items.extra;
		if (!extra)
			return;

		let eLen = extra.length;
		for (let i = 0; i < eLen; i++) {
			let e = extra[i];

			let item = extend({}, e);

			if (item.type === 'skin') {
				let skinBlueprint = skins.getBlueprint(item.skinId);
				item.skinId = item.skinId;
				item.name = skinBlueprint.name;
				item.sprite = skinBlueprint.sprite;
			} else if (item.generate) {
				let generated = generator.generate(item);
				if (item.worth)
					generated.worth = item.worth;
				if (item.infinite)
					generated.infinite = true;

				if (item.factions)
					generated.factions = item.factions;

				item = generated;
			}

			let id = 0;
			list.items.forEach(function (checkItem) {
				if (checkItem.id >= id)
					id = checkItem.id + 1;
			});

			item.id = id;

			list.items.push(item);
		}
	},

	findItem: function (itemId, sourceName) {
		let list = this.items[sourceName];
		if (!list)
			return null;

		return list.items.find(i => i.id === itemId);
	},

	removeItem: function (itemId, sourceName) {
		let list = this.items[sourceName];
		if (!sourceName)
			return null;

		return list.items.spliceFirstWhere(i => i.id === itemId);
	}
};
