const rune = require('./craftActions/rune');
const weapon = require('./craftActions/weapon');
const armor = require('./craftActions/armor');
const idol = require('./craftActions/idol');

module.exports = [{
	name: 'Level 10 Rune',
	description: '',
	materials: [{
		name: 'Runecrafter\'s Toil',
		quantity: 3
	}],
	craftAction: rune.bind(null, { 
		level: 10,
		magicFind: 900
	})
}, {
	name: 'Level 15 Rune',
	description: '',
	materials: [{
		name: 'Runecrafter\'s Toil',
		quantity: 10
	}],
	craftAction: rune.bind(null, {
		level: 15,
		magicFind: 1400
	})
}, {
	name: 'Level 20 Rune',
	description: '',
	materials: [{
		name: 'Runecrafter\'s Toil',
		quantity: 30
	}],
	craftAction: rune.bind(null, {
		level: 20,
		magicFind: 1900
	})
}, {
	name: 'Legendary Level 15 Weapon',
	description: '',
	materials: [{
		name: 'Godly Promise',
		quantity: 6
	}],
	craftAction: weapon.bind(null, {
		level: 15,
		quality: 4
	})
}, {
	name: 'Perfect Level 10 Ring',
	description: '',
	materials: [{
		name: 'The Other Heirloom',
		quantity: 3
	}],
	craftAction: armor.bind(null, {
		level: 10,
		slot: 'finger',
		perfection: 1,
		quality: 1
	})
}, {
	name: '5 Random Idols',
	description: '',
	materials: [{
		name: 'Tradesman\'s Pride',
		quantity: 10
	}],
	craftAction: idol.bind(null, {
		rolls: 5
	})
}, {
	name: 'Princess Morgawsa\'s Trident',
	description: '',
	materials: [{
		name: 'Benthic Incantation',
		quantity: 12
	}],
	craftAction: weapon.bind(null, {
		name: 'Princess Morgawsa\'s Trident',
		level: [18, 20],
		attrRequire: 'int',
		quality: 4,
		slot: 'twoHanded',
		sprite: [0, 0],
		spritesheet: '../../../images/legendaryItems.png',
		type: 'Trident',
		description: 'Summoned from the ancient depths of the ocean by the Benthic Incantation.',
		stats: ['elementFrostPercent', 'elementFrostPercent', 'elementFrostPercent'],
		effects: [{
			type: 'freezeOnHit',
			rolls: {
				i_chance: [2, 5],
				i_duration: [2, 4]
			}
		}],
		spellName: 'projectile',
		spellConfig: {
			statType: 'int',
			statMult: 1,
			element: 'arcane',
			auto: true,
			cdMax: 7,
			castTimeMax: 0,
			manaCost: 0,
			range: 9,
			random: {
				damage: [1.65, 10.81]
			}
		}
	})
}, {
	name: 'Steelclaw\'s Bite',
	description: '',
	materials: [{
		name: 'Fangs of Fury',
		quantity: 20
	}],
	craftAction: weapon.bind(null, {
		name: 'Steelclaw\'s Bite',
		level: [18, 20],
		attrRequire: 'dex',
		quality: 4,
		slot: 'oneHanded',
		sprite: [1, 0],
		spritesheet: '../../../images/legendaryItems.png',
		type: 'Curved Dagger',
		description: 'The blade seems to be made of some kind of bone and steel alloy.',
		stats: ['dex', 'dex', 'addCritMultiplier', 'addCritMultiplier'],
		effects: [{
			type: 'damageSelf',
			properties: {
				element: 'poison'
			},
			rolls: {
				i_percentage: [8, 22]
			}
		}, {
			type: 'alwaysCrit',
			rolls: {}
		}],
		spellName: 'melee',
		spellConfig: {
			statType: 'dex',
			statMult: 1,
			cdMax: 3,
			castTimeMax: 0,
			useWeaponRange: true,
			random: {
				damage: [0.88, 5.79]
			}
		}
	})
}];
