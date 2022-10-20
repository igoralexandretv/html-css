define([

], function (

) {
	let stats = {
		vit: 'vitality',
		regenHp: 'health regeneration',
		manaMax: 'maximum mana',
		regenMana: 'mana regeneration',
		str: 'strength',
		int: 'intellect',
		dex: 'dexterity',
		armor: 'armor',

		blockAttackChance: 'chance to block attacks',
		blockSpellChance: 'chance to block spells',

		dodgeAttackChance: 'chance to dodge attacks',
		dodgeSpellChance: 'chance to dodge spells',

		addCritChance: 'global crit chance',
		addCritMultiplier: 'global crit multiplier',
		addAttackCritChance: 'attack crit chance',
		addAttackCritMultiplier: 'attack crit multiplier',
		addSpellCritChance: 'spell crit chance',
		addSpellCritMultiplier: 'spell crit multiplier',
		magicFind: 'increased item quality',
		itemQuantity: 'increased item quantity',
		sprintChance: 'sprint chance',
		allAttributes: 'to all attributes',
		xpIncrease: 'additional xp per kill',
		lvlRequire: 'level requirement reduction',

		elementArcanePercent: 'increased arcane damage',
		elementFrostPercent: 'increased frost damage',
		elementFirePercent: 'increased fire damage',
		elementHolyPercent: 'increased holy damage',
		elementPoisonPercent: 'increased poison damage',
		physicalPercent: 'increased physical damage',

		elementPercent: 'increased elemental damage',
		spellPercent: 'increased spell damage',

		elementAllResist: 'all resistance',
		elementArcaneResist: 'arcane resistance',
		elementFrostResist: 'frost resistance',
		elementFireResist: 'fire resistance',
		elementHolyResist: 'holy resistance',
		elementPoisonResist: 'poison resistance',

		attackSpeed: 'attack speed',
		castSpeed: 'cast speed',

		lifeOnHit: 'life gained on dealing physical damage',

		auraReserveMultiplier: 'aura mana reservation multiplier',

		//This stat is used for gambling when you can't see the stats
		stats: 'stats',

		//Fishing
		weight: 'lb',
		//Rods
		catchChance: 'extra catch chance',
		catchSpeed: 'faster catch speed',
		fishRarity: 'higher fish rarity',
		fishWeight: 'increased fish weight',
		fishItems: 'extra chance to hook items'
	};

	return {
		translate: function (stat) {
			return stats[stat];
		}
	};
});
