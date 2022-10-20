module.exports = {
	events: {
		onGetText: function (item) {
			let rolls = item.effects.find(e => (e.type === 'freezeOnHit')).rolls;

			return `${rolls.chance}% chance on hit to freeze target for ${rolls.duration} ticks`;
		},

		afterDealDamage: function (item, damage, target) {
			let rolls = item.effects.find(e => (e.type === 'freezeOnHit')).rolls;

			let chanceRoll = Math.random() * 100;
			if (chanceRoll >= rolls.chance)
				return;

			target.effects.addEffect({
				type: 'slowed',
				chance: 1,
				ttl: rolls.duration
			});
		}
	}
};
