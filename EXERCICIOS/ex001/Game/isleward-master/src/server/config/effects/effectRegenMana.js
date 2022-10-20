module.exports = {
	type: 'regenMana',

	amount: 1,

	init: function () {
		this.obj.stats.addStat('regenMana', this.amount);
	},

	destroy: function () {
		this.obj.stats.addStat('regenMana', -this.amount);
	},

	update: function () {

	},

	events: {

	}
};
