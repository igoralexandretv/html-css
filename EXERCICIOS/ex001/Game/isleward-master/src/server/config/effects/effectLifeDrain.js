let combat = require('../../combat/combat');

module.exports = {
	type: 'lifeDrain',

	events: {
		afterTick: function () {
			let newDamage = combat.getDamage({
				source: {
					stats: {
						values: {}
					}
				},
				isAttack: false,
				target: this.obj,
				damage: this.amount,
				element: this.element,
				noScale: this.noScale,
				noCrit: true
			});
				
			this.obj.stats.takeDamage(newDamage, 1, this.caster);
		}
	}
};
