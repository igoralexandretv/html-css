let mobBuilder = require('../../world/mobBuilder');

module.exports = {
	id: 'gaekatla',
	name: 'Gaekatla',
	description: 'Although her temple is now in ruins, Gaekatla is still revered as the goddess of fertility, nature and life and has a small but dedicated following in Fjolgard.',

	uniqueStat: {
		chance: {
			min: 5,
			max: 20
		},

		generate: function (item) {
			let chance = this.chance;
			let chanceRoll = ~~(random.norm(chance.min, chance.max) * 10) / 10;

			let result = null;
			if (item.effects)
				result = item.effects.find(e => (e.factionId === 'gaekatla'));

			if (!result) {
				if (!item.effects)
					item.effects = [];

				result = {
					factionId: 'gaekatla',
					chance: chanceRoll,
					text: chanceRoll + '% chance on kill to summon a critter to assist you in battle',
					events: {}
				};

				item.effects.push(result);
			} else if (!result.chance) {
				//This is a hack for items that were never generated properly
				result.chance = chanceRoll;
				result.text = chanceRoll + '% chance on kill to summon a critter to assist you in battle';
			}

			if (!result.events)
				result.events = {};

			for (let e in this.events) 
				result.events[e] = this.events[e];

			return result;
		},

		events: {
			afterKillMob: function (item, mob) {
				let effect = item.effects.find(e => (e.factionId === 'gaekatla'));

				let roll = Math.random() * 100;
				if (roll >= effect.chance)
					return;

				//Spawn a mob
				let spawnedMob = mob.instance.spawners.spawn({
					amountLeft: 1,
					blueprint: {
						x: mob.x,
						y: mob.y,
						cell: 34,
						sheetName: 'mobs',
						name: 'Squiggle',
						properties: {
							cpnFollower: {
								lifetime: 100
							}
						},
						extraProperties: {
							follower: {
								master: this
							}
						}
					}
				});

				mobBuilder.build(spawnedMob, {
					level: item.level,
					faction: this.aggro.faction,
					walkDistance: 2,
					regular: {
						drops: 0,
						hpMult: 1,
						dmgMult: 1
					},
					spells: [{
						type: 'melee',
						damage: 1,
						statMult: 0.1
					}]
				}, 'regular');

				spawnedMob.follower.bindEvents();
			}
		}
	},

	rewards: {

	}
};
