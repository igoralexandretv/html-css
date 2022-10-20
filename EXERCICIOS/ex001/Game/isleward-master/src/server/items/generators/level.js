module.exports = {
	generate: function (item, blueprint) {
		let level = blueprint.level;
		if (level instanceof Array) {
			item.level = level[0] + ~~(Math.random() * (level[1] - level[0]));
			return;
		}

		item.level = ~~(level || 1);
	}
};
