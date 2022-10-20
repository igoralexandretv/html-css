let combat = require('../../combat/combat');

module.exports = {
	id: 'akarei',
	name: 'The Akarei',
	description: 'Not much is known about the Akarei. Dwelling deep underground in the Crystal Caves of Fjolarok, they have taken an interest in the local fauna.',

	uniqueStat: {
		damage: 1,

		chance: {
			min: 20,
			max: 45
		},

		generate: function (item) {
			let chance = this.chance;
			let chanceRoll = ~~(random.norm(chance.min, chance.max) * 10) / 10;

			let result = null;
			if (item.effects)
				result = item.effects.find(e => (e.factionId === 'akarei'));

			if (!result) {
				if (!item.effects)
					item.effects = [];

				result = {
					factionId: 'akarei',
					properties: {
						chance: chanceRoll
					},
					text: chanceRoll + '% chance on crit to cast a lightning bolt',
					events: {}
				};

				item.effects.push(result);
			}

			if (!result.events)
				result.events = {};

			for (let e in this.events) 
				result.events[e] = this.events[e];

			return result;
		},

		events: {
			beforeDealDamage: function (item, damage, target) {
				if (!damage.crit)
					return;

				let effect = item.effects.find(e => (e.factionId === 'akarei'));

				let roll = Math.random() * 100;
				if (roll >= effect.properties.chance)
					return;

				let cbExplode = function (boundTarget) {
					if ((this.destroyed) || (boundTarget.destroyed))
						return;

					let damageConfig = combat.getDamage({
						source: this,
						target: boundTarget,
						damage: item.level * 5,
						element: 'arcane',
						noCrit: true
					});

					boundTarget.stats.takeDamage(damageConfig, 1, this);
				};

				this.instance.syncer.queue('onGetObject', {
					id: this.id,
					components: [{
						type: 'lightningEffect',
						toX: target.x,
						toY: target.y
					}]
				}, -1);

				this.spellbook.registerCallback(this.id, cbExplode.bind(this, target), 1);
			}
		}
	},

	rewards: {

	}
};
