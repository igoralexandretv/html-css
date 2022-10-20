module.exports = (scope, map) => {
	const { templates } = scope;
	scope.tileMappings = {};

	let oldMap = map.oldMap;

	templates
		.filter(r => r.properties.mapping)
		.forEach(m => {
			let x = m.x;
			let y = m.y;
			let w = m.width;
			let h = m.height;

			let baseTile = oldMap[x][y];
			baseTile = (baseTile || '')
				.replace('0,', '')
				.replace(',', '');

			let mapping = scope.tileMappings[baseTile] = [];

			for (let i = x + 2; i < x + w; i++) {
				for (let j = y; j < y + h; j++) {
					let oM = oldMap[i][j];

					if (oM.replace) {
						oM = oM
							.replace('0,', '')
							.replace(',', '');
					}

					mapping.push(oM);
				}
			}
		});
};
