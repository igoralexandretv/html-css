module.exports = {
	type: 'regenHp',

	amount: 1,

	init: function () {
		this.obj.stats.addStat('regenHp', this.amount);
	},

	destroy: function () {
		this.obj.stats.addStat('regenHp', -this.amount);
	},

	update: function () {

	},

	events: {

	}
};
