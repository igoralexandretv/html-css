module.exports = {
	events: {
		onGetText: function (item) {
			return 'your hits always crit';
		},

		onBeforeCalculateDamage: function (item, damage, target) {
			damage.crit = true;
		}
	}
};
