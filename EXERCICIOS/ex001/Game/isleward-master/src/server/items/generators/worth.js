module.exports = {
	generate: function (item, blueprint) {
		const level = item.originalLevel || item.level;
		
		item.worth = ~~(Math.pow(level, 1.5) + (Math.pow((item.quality + 1), 2) * 10));

		if (item.spell)
			item.worth *= 5;
	}
};
