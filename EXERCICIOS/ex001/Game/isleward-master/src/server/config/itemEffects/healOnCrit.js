module.exports = {
	events: {
		onGetText: function (item) {
			let rolls = item.effects.find(e => (e.type === 'healOnCrit')).rolls;
			let chance = rolls.chance || 100;
			let amount = rolls.amount;
			let percentage = rolls.percentage;

			let text = '';

			if (chance < 100)
				text = `${chance}% chance to heal on crit for `;
			else
				text = 'critical hits heal you for ';

			if (percentage)
				text += `${percentage}% of damage dealt`;
			else
				text += `${amount || '?'} health`;

			return text;
		},

		afterDealDamage: function (item, damage, target) {
			if (!damage.crit)
				return;

			let rolls = item.effects.find(e => (e.type === 'healOnCrit')).rolls;

			let chanceRoll = Math.random() * 100;
			if (chanceRoll >= (rolls.chance || 100))
				return;

			let amount = rolls.amount || ((damage.dealt / 100) * rolls.percentage);

			this.stats.getHp({
				amount: amount
			}, this);
		}
	}
};
