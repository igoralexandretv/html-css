module.exports = {
	id: 'anglers',
	name: 'The Anglers',
	description: 'A guild of fishermen that have mastered the arts of angling, lurecrafting and baiting. Many Anglers have taken it upon themselves to help others grow their fishing skills.',

	uniqueStat: {
		chance: {
			min: 2,
			max: 7
		},

		generate: function (item) {
			let chance = this.chance;
			let chanceRoll = ~~(random.expNorm(chance.min, chance.max));

			let result = null;
			if (item.effects)
				result = item.effects.find(e => (e.factionId === 'anglers'));

			if (!result) {
				if (!item.effects)
					item.effects = [];

				result = {
					factionId: 'anglers',
					chance: chanceRoll,
					text: chanceRoll + '% chance to multi-catch',
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
			beforeGatherResourceComplete: function (item, { items }) {
				let effect = item.effects.find(e => (e.factionId === 'anglers'));

				let roll = Math.random() * 100;
				if (roll >= effect.chance)
					return;

				let pick = items[~~(Math.random() * items.length)];
				items.push(extend({}, pick));
			}
		}
	},

	rewards: {

	}
};
