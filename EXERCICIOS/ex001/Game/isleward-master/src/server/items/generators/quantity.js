module.exports = {
	generate: function (item, blueprint) {
		let qty = blueprint.quantity;

		if (!qty)
			return;

		if (qty instanceof Array)
			item.quantity = qty[0] + ~~(Math.random() * (qty[1] - qty[0]));
		else
			item.quantity = qty;
	}
};
