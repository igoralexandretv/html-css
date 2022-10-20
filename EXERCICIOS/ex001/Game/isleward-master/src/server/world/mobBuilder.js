//Balance
const { hpMults, dmgMults } = require('../config/consts');

//Imports
const animations = require('../config/animations');
const itemGenerator = require('../items/generator');

//Mobs will be given random items to equip for these slots
const generateSlots = [
	'head',
	'chest',
	'neck',
	'hands',
	'waist',
	'legs',
	'feet',
	'finger',
	'trinket',
	'twoHanded'
];

//Mobs will pick one of these stats to be force rolles onto their items
const statSelector = ['str', 'dex', 'int'];

//These stat values are synced to players
const syncStats = ['hp', 'hpMax', 'mana', 'manaMax', 'level'];

//Component generators
const buildCpnMob = (mob, blueprint, typeDefinition) => {
	const { walkDistance, grantRep, deathRep, patrol, needLos } = blueprint;

	const cpnMob = mob.addComponent('mob');
	extend(cpnMob, {
		walkDistance,
		grantRep,
		deathRep,
		needLos
	});

	if (patrol !== undefined)
		cpnMob.patrol = blueprint.patrol;

	if (cpnMob.patrol)
		cpnMob.walkDistance = 1;
};

const buildCpnStats = (mob, blueprint, typeDefinition) => {
	const {
		level,
		hpMult: baseHpMult = typeDefinition.hpMult
	} = blueprint;

	const hpMax = ~~(level * 40 * hpMults[level - 1] * baseHpMult);

	const cpnStats = mob.addComponent('stats', {
		values: {
			level,
			hpMax
		}
	});

	//Hack to disallow low level mobs from having any lifeOnHit
	// since that makes it very difficult (and confusing) for low level players
	if (level <= 3)
		cpnStats.values.lifeOnHit = 0;
};

const buildCpnInventory = (mob, blueprint, { drops }, preferStat) => {
	const { level } = blueprint;

	const cpnInventory = mob.addComponent('inventory', drops);

	cpnInventory.inventorySize = -1;
	cpnInventory.dailyDrops = blueprint.dailyDrops;

	if (!drops?.blueprints || drops?.alsoRandom) {
		generateSlots.forEach(slot => {
			const item = itemGenerator.generate({
				noSpell: true,
				level,
				slot,
				quality: 4,
				forceStats: [preferStat]
			});
			delete item.spell;
			item.eq = true;

			cpnInventory.getItem(item);
		});
	} else {
		//TODO: Don't give mobs these items: they'll drop them anyway
		drops.blueprints.forEach(d => {
			if (d.type === 'key')
				return;

			const drop = extend({}, d);
			drop.level = level;

			cpnInventory.getItem(itemGenerator.generate(drop));
		});
	}
};

const buildCpnSpells = (mob, blueprint, typeDefinition, preferStat) => {
	const dmgMult = 4.5 * typeDefinition.dmgMult * dmgMults[blueprint.level - 1];

	const spells = extend([], blueprint.spells);

	mob.addComponent('spellbook', { spells });

	let spellCount = 0;
	if (mob.isRare)
		spellCount = 1;

	for (let i = 0; i < spellCount; i++) {
		const rune = itemGenerator.generate({ spell: true });
		rune.eq = true;

		mob.inventory.getItem(rune);
	}

	mob.spellbook.spells.forEach(s => {
		s.dmgMult = s.name ? dmgMult / 3 : dmgMult;
		s.statType = preferStat;
		s.manaCost = 0;

		if (!s.animation && mob.sheetName === 'mobs' && animations.mobs[mob.cell]) 
			s.animation = 'basic';
	});
};

const fnComponentGenerators = [
	buildCpnMob, buildCpnStats, buildCpnInventory, buildCpnSpells
];

//Main Generator
/*
	mob = the mob object
	blueprint = mob blueprint (normally from the zoneFile)
	type = regular,rare
	zoneName = the name of the zone
*/
const build = (mob, blueprint, type, zoneName) => {
	mob.instance.eventEmitter.emit('onBeforeBuildMob', zoneName, mob.name.toLowerCase(), blueprint);

	const typeDefinition = blueprint[type] || blueprint;

	if (blueprint.nonSelectable)
		mob.nonSelectable = true;

	mob.addComponent('effects');
	if (type === 'rare') {
		mob.effects.addEffect({	type: 'rare' });
		mob.isRare = true;

		mob.baseName = mob.name;
		mob.name = typeDefinition.name ?? mob.name;
	}

	if (typeDefinition.sheetName)
		mob.sheetName = typeDefinition.sheetName;

	if (typeDefinition.has('cell'))
		mob.cell = typeDefinition.cell;

	mob.addComponent('equipment');

	const preferStat = statSelector[~~(Math.random() * 3)];

	fnComponentGenerators.forEach(fn => fn(mob, blueprint, typeDefinition, preferStat));

	if (blueprint.attackable !== false) {
		mob.addComponent('aggro', { faction: blueprint.faction });

		mob.aggro.calcThreatCeiling(type);
	}

	const zoneConfig = instancer.instances[0].map.zoneConfig;

	const chats = zoneConfig?.chats?.[mob.name.toLowerCase()];
	if (chats)
		mob.addComponent('chatter', { chats });

	const dialogues = zoneConfig?.dialogues?.[mob.name.toLowerCase()];
	if (dialogues)
		mob.addComponent('dialogue', { config: dialogues });

	if (blueprint?.properties?.cpnTrade)
		mob.addComponent('trade', blueprint.properties.cpnTrade);

	mob.instance.eventEmitter.emit('onAfterBuildMob', {
		zoneName,
		mob
	});

	const statValues = mob.stats.values;
	statValues.hp = statValues.hpMax;

	syncStats.forEach(s => mob.syncer.setObject(false, 'stats', 'values', s, statValues[s]));
};

module.exports = { build };
