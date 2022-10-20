module.exports = {
	type: 'swiftness',

	amount: 1,

	init: function () {
		this.obj.stats.addStat('sprintChance', this.amount);
	},

	destroy: function () {
		this.obj.stats.addStat('sprintChance', -this.amount);
	},

	update: function () {

	},

	events: {

	}
};
