module.exports = {
	type: 'stunned',

	init: function () {
		if (this.obj.spellbook)
			this.obj.spellbook.stopCasting();
	},

	events: {
		beforeMove: function (targetPos) {
			targetPos.success = false;
		},

		beforeDealDamage: function (damage) {
			if (damage)
				damage.failed = true;
		},

		beforeCastSpell: function (successObj) {		
			successObj.success = false;
		}
	}
};
