let prefixes = require('../config/prefixes');
let suffixes = require('../config/suffixes');

module.exports = {
	generators: [
		'basic', ['basic'],
		['gPrefix', 'gSuffix'],
		['gPrefix', 'gSuffix'],
		['gPrefix', 'gSuffix']
	],
	generate: function (item, blueprint) {
		if (blueprint.name) {
			item.name = blueprint.name;
			return;
		} else if (blueprint.noName) {
			item.name = item.type;
			return;
		}

		let gen = this.generators[item.quality];
		if (!(gen instanceof Array))
			gen = [gen];

		gen.forEach(g => this.types[g].call(this, item, blueprint));
	},
	types: {
		basic: function (item, blueprint) {
			item.name = item.type;
		},

		gPrefix: function (item, blueprint) {
			let list = prefixes.generic.concat(prefixes.slots[item.slot] || []);

			if (item.stats.armor)
				list = list.concat(prefixes.armor);
			else if (item.slot === 'twoHanded')
				list = list.concat(prefixes.weapons);

			let pick = list[~~(Math.random() * list.length)];
			item.name = pick[0].toUpperCase() + pick.substr(1);

			if (item.name.indexOf('%') > -1) {
				let replacer = (Math.random() < 0.5) ? '\'s' : '';
				item.name = item.name.split('%').join(replacer);
			}
		},

		gSuffix: function (item, blueprint) {
			let list = null;

			if (item.slot === 'tool') 
				list = suffixes.slots.tool;
			else {
				list = suffixes.generic.concat(suffixes.slots[item.slot] || []);

				if (item.stats.armor)
					list = list.concat(suffixes.armor);
				else if (item.slot === 'twoHanded')
					list = list.concat(suffixes.weapons);
			}

			let pick = list[~~(Math.random() * list.length)];
			item.name += ' ' + pick[0].toUpperCase() + pick.substr(1);
		}
	}
};
