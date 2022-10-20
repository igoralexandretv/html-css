const calculateAugmentMaterials = require('./enchanting/calculateAugmentMaterials');

const reroll = require('./enchanting/craftActions/reroll');
const relevel = require('./enchanting/craftActions/relevel');
const augment = require('./enchanting/craftActions/augment');
const reslot = require('./enchanting/craftActions/reslot');
const reforge = require('./enchanting/craftActions/reforge');
const scour = require('./enchanting/craftActions/scour');

module.exports = [{
	name: 'Augment',
	description: 'Adds a random stat to an item. Items can hold a maximum of three augments.',
	materialGenerator: calculateAugmentMaterials,
	craftAction: augment,
	needItems: [{
		info: 'Pick an item to augment',
		withProps: ['slot'],
		withoutProps: ['noAugment'],
		checks: [
			item => !item.power || item.power < 3
		]
	}]
}, {
	name: 'Reroll',
	description: 'Rerolls an item\'s implicit and explicit stats. Augmentations are not affected.',
	materials: [{
		name: 'Unstable Idol',
		quantity: 1
	}],
	needItems: [{
		info: 'Pick an item to reroll',
		withProps: ['slot'],
		withoutProps: ['noAugment']
	}],
	craftAction: reroll
}, {
	name: 'Increase Level',
	description: 'Adds [1 - 3] to an item\'s required level. Items with higher levels yield better stats when rerolled.',
	materials: [{
		name: 'Ascendant Idol',
		quantity: 1
	}],
	needItems: [{
		info: 'Pick the item you wish to ascend',
		withProps: ['slot'],
		withoutProps: ['noAugment'],
		checks: [
			item => item.level && (item.originalLevel || item.level) < consts.maxLevel
		]
	}],
	craftAction: relevel
}, {
	name: 'Reslot',
	description: 'Reforms the item into a random new item that retains the source item\'s quality and stat types.',
	materials: [{
		name: 'Dragon-Glass Idol',
		quantity: 1
	}],
	needItems: [{
		info: 'Pick an item to reslot',
		withProps: ['slot'],
		withoutProps: ['noAugment', 'effects', 'factions']
	}],
	craftAction: reslot
}, {
	name: 'Reforge Weapon',
	description: 'Rerolls a weapon\'s damage range.',
	materials: [{
		name: 'Bone Idol',
		quantity: 1
	}],
	needItems: [{
		info: 'Pick an item to reforge',
		withProps: ['slot', 'spell'],
		withoutProps: ['noAugment']
	}],
	craftAction: reforge
}, {
	name: 'Scour',
	description: 'Wipe all augments from an item.',
	materials: [{
		name: 'Smoldering Idol',
		quantity: 1
	}],
	needItems: [{
		info: 'Pick an item to scour',
		withProps: ['slot', 'power'],
		withoutProps: ['noAugment']
	}],
	craftAction: scour,
	checks: [
		item => item.power && item.power >= 1 
	]
}];
