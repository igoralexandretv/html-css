module.exports = {
	polyline: function (size, blueprint, cell, mapScale) {
		let lowX = size.w;
		let lowY = size.h;
		let highX = 0;
		let highY = 0;

		blueprint.area = cell.polyline.map(function (v) {
			let x = ~~((v.x + cell.x) / mapScale);
			let y = ~~((v.y + cell.y) / mapScale);

			if (x < lowX)
				lowX = x;
			if (x > highX)
				highX = x;

			if (y < lowY)
				lowY = y;
			if (y > highY)
				highY = y;

			return [x, y];
		});

		blueprint.x = lowX;
		blueprint.y = lowY;
		blueprint.width = (highX - lowX);
		blueprint.height = (highY - lowY);
	}
};
