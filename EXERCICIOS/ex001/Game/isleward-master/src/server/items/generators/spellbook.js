let spells = require('../../config/spells');
let spellsConfig = require('../../config/spellsConfig');
let configTypes = require('../config/types');

const qualityGenerator = require('./quality');
const qualityCount = qualityGenerator.qualities.length;

const buildRolls = (item, blueprint, { random: spellProperties, negativeStats = [] }, quality) => {
	//We randomise the order so a random property gets to 'pick first'
	// otherwise it's easier for earlier properties to use more of the valuePool
	const propKeys = Object
		.keys(spellProperties)
		.sort((a, b) => Math.random() - Math.random());

	const propCount = propKeys.length;

	const maxRoll = (quality + 1) / qualityCount;
	const minSum = (quality / qualityCount) * propCount;

	let runningTotal = 0;

	const result = {};

	for (let i = 0; i < propCount; i++) {
		const minRoll = Math.max(0, minSum - runningTotal - ((propCount - (i + 1)) * maxRoll));

		let roll = minRoll + (Math.random() * (maxRoll - minRoll));

		runningTotal += roll;

		const prop = propKeys[i];
		const isNegative = negativeStats.includes(prop);

		if (isNegative)
			roll = 1 - roll;

		const useLevel = item.originalLevel || item.level;
		const scaledRoll = roll * (useLevel / consts.maxLevel);

		result[prop] = scaledRoll;
	}

	return result;
};

module.exports = {
	generate: function (item, blueprint) {
		blueprint = blueprint || {};
		let spellQuality = blueprint ? blueprint.spellQuality : '';
		let spellName = blueprint.spellName;

		if (!spellName) {
			let spellList = Object.keys(spellsConfig.spells).filter(s => !spellsConfig.spells[s].auto && !spellsConfig.spells[s].noDrop);
			spellName = spellList[~~(Math.random() * spellList.length)];
		}

		let spell = extend({}, spellsConfig.spells[spellName], blueprint.spellConfig);
		let spellAesthetic = spells.spells.find(s => s.name.toLowerCase() === spellName) || {};

		if (!item.slot) {
			let sprite = [10, 0];
			let statType = spell.statType;
			if (statType === 'dex')
				sprite = [10, 1];
			else if (statType === 'str')
				sprite = [10, 2];
			else if (statType instanceof Array) {
				if ((statType.indexOf('dex') > -1) && (statType.indexOf('int') > -1))
					sprite = [10, 3];
				else if ((statType.indexOf('str') > -1) && (statType.indexOf('int') > -1))
					sprite = [10, 4];
			}

			item.name = 'Rune of ' + spellAesthetic.name;
			item.ability = true;
			item.sprite = sprite;
		} else if (spellQuality === 'basic')
			item.stats = {};

		if (blueprint.spellConfig)
			spellAesthetic = extend({}, spellAesthetic, blueprint.spellConfig);

		item.spell = {
			name: spellAesthetic.name || 'Weapon Damage',
			type: spellAesthetic.type || spellName,
			rolls: {},
			values: {}
		};

		if (blueprint.spellConfig) 
			extend(item.spell, blueprint.spellConfig);

		if (item.type) {
			let typeConfig = configTypes.types[item.slot][item.type];
			if (typeConfig)
				extend(spell, typeConfig.spellConfig);
		}

		//If the item has a slot, we need to generate a new quality for the rune
		let quality = item.quality;
		if (item.slot) {
			const tempItem = {};

			const tempBlueprint = extend({}, blueprint);
			delete tempBlueprint.quality;
			tempBlueprint.quality = blueprint.spellQuality;

			qualityGenerator.generate(tempItem, tempBlueprint);

			quality = tempItem.quality;
			item.spell.quality = quality;
		}

		const rolls = buildRolls(item, blueprint, spell, quality);
		
		Object.entries(spell.random || {}).forEach(entry => {
			const [ property, range ] = entry;
			const roll = rolls[property];

			item.spell.rolls[property] = roll;

			const isInt = property.indexOf('i_') === 0;
			let useProperty = property;
			const minRange = range[0];
			const maxRange = range[1];

			let val = minRange + ((maxRange - minRange) * roll);

			if (isInt) {
				useProperty = property.substr(2);
				val = Math.round(val);
			} else
				val = ~~(val * 100) / 100;

			val = Math.max(range[0], Math.min(range[1], val));

			item.spell.values[useProperty] = val;
		});

		if (blueprint.spellProperties) {
			item.spell.properties = {};
			for (let p in blueprint.spellProperties) 
				item.spell.properties[p] = blueprint.spellProperties[p];
		}

		if (item.range) {
			item.spell.properties = item.spell.properties || {};
			item.spell.properties.range = item.range;
		}
	}
};
