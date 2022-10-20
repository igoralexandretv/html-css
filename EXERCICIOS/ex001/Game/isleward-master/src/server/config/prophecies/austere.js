module.exports = {
	type: 'austere',

	init: function () {

	},

	simplify: function () {
		return this.type;
	},

	events: {
		beforeEquipItem: function (msg) {
			if (msg.item.quality > 1) {
				msg.success = false;
				msg.msg = 'You shun fancy equipment';
			}
		},

		beforeLearnAbility: function (msg) {
			if (msg.item.quality > 1) {
				msg.success = false;
				msg.msg = 'You shun fancy equipment';
			}
		}
	}
};
