module.exports = {
	events: {
		onConsumeItem (effectResult, item, effect) {
			const cpnStats = this.stats;

			const stat = effect.rolls.stat;
			let amount = effect.rolls.amount;

			if (stat === 'hp') {
				if (cpnStats.values.hp >= cpnStats.values.hpMax) {
					effectResult.success = false;
					effectResult.errorMessage = 'You are already at full health.';

					return;
				}

				if (typeof(amount) === 'string' && amount.indexOf('%') > -1)
					amount = (cpnStats.values.hpMax / 100) * ~~amount.replace('%', '');

				cpnStats.getHp({
					amount: amount,
					threatMult: 0
				}, item);
			} else
				cpnStats.addStat(stat, amount);
		},

		onGetText (item, effect) {
			return `Restores ${effect.rolls.amount} ${effect.rolls.stat}`;
		}
	}
};
