let combat = require('../../combat/combat');

module.exports = {
	events: {
		element: null,

		onGetText: function (item) {
			let rolls = item.effects.find(e => (e.type === 'damageSelf')).rolls;

			return `you take ${rolls.percentage}% of the damage you deal`;
		},

		afterDealDamage: function (item, damage, target) {
			let effect = item.effects.find(e => (e.type === 'damageSelf'));
			let rolls = effect.rolls;

			let amount = (damage.dealt / 100) * rolls.percentage;

			let newDamage = combat.getDamage({
				source: {
					stats: {
						values: {}
					}
				},
				isAttack: false,
				target: this,
				damage: amount,
				element: effect.properties.element,
				noCrit: true
			});

			newDamage.noEvents = true;

			this.stats.takeDamage(newDamage, 1, this);
		}
	}
};
