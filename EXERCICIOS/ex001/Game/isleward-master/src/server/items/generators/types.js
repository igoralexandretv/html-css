let configTypes = require('../config/types');
let armorMaterials = require('../config/armorMaterials');

module.exports = {
	generate: function (item, blueprint) {
		let type = blueprint.type;

		if (!type) {
			//Pick a material type first
			const types = configTypes.types[item.slot];
			const typeArray = Object.entries(types);
			const materials = Object.values(types)
				.map(t => {
					return t.material;
				})
				.filter((m, i) => i === typeArray.findIndex(t => t[1].material === m));

			const material = materials[~~(Math.random() * materials.length)];

			const possibleTypes = {};

			Object.entries(types)
				.forEach(t => {
					const [ typeName, typeConfig ] = t;

					if (typeConfig.material === material)
						possibleTypes[typeName] = typeConfig;
				});

			type = _.randomKey(possibleTypes);
		}

		let typeBlueprint = configTypes.types[item.slot][type] || {};

		if (!typeBlueprint)
			return;

		item.type = type;
		item.sprite = extend([], blueprint.sprite || typeBlueprint.sprite);
		if (typeBlueprint.spritesheet && !blueprint.spritesheet)
			item.spritesheet = typeBlueprint.spritesheet;

		if (typeBlueprint.spellName) {
			blueprint.spellName = typeBlueprint.spellName;
			blueprint.spellConfig = typeBlueprint.spellConfig;
		}

		if (typeBlueprint.range)
			item.range = typeBlueprint.range;

		if (typeBlueprint.material) {
			let material = armorMaterials[typeBlueprint.material];
			blueprint.attrRequire = material.attrRequire;
		}

		if (typeBlueprint.implicitStat && !blueprint.implicitStat)
			blueprint.implicitStat = typeBlueprint.implicitStat;

		if (typeBlueprint.attrRequire && !blueprint.attrRequire)
			blueprint.attrRequire = typeBlueprint.attrRequire;
	}
};
