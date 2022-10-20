/* eslint-disable max-lines-per-function */
module.exports = (scope, map) => {
	const { templates } = scope;

	templates.forEach((r, typeId) => {
		if (r.properties.mapping)
			return;

		r.typeId = typeId;

		let { noRotate = false, canFlipX = true, canFlipY = true } = r.properties;
		//Property values are strings. So we turn '1' and '0' into 1 and 0
		canFlipX = ~~canFlipX;
		canFlipY = ~~canFlipY;

		//Fix Polygons
		r.objects.forEach(o => {
			if (!o.fog)
				return;

			const newArea = o.area.map(p => {
				const [ px, py ] = p;

				const hpx = px - r.x;
				const hpy = py - r.y;

				return [hpx, hpy];
			});

			Object.assign(o, {
				x: o.x - r.x,
				y: o.y - r.y,
				area: newArea
			});
		});

		//FlipX Loop
		for (let i = 0; i < 2; i++) {
			if (i && !canFlipX)
				continue;

			//FlipY Loop
			for (let j = 0; j < 2; j++) {
				if (j && !canFlipY)
					continue;

				//Rotate Loop
				for (let k = 0; k < 2; k++) {
					if (k && noRotate)
						continue;

					if (i + j + k === 0)
						continue;

					let flipped = extend({
						flipX: !!i,
						flipY: !!j,
						rotate: !!k
					}, r);

					flipped.exits.forEach(e => {
						let direction = JSON.parse(e.properties.exit);

						if (flipped.flipX) {
							direction[0] *= -1;
							e.x = r.x + r.width - (e.x - r.x) - e.width;
						}
						if (flipped.flipY) {
							direction[1] *= -1;
							e.y = r.y + r.height - (e.y - r.y) - e.height;
						}
						if (flipped.rotate) {
							direction = [direction[1], direction[0]];
							let t = e.x;
							e.x = r.x + (e.y - r.y);
							e.y = r.y + (t - r.x);
							t = e.width;
							e.width = e.height;
							e.height = t;
						}

						e.properties.exit = JSON.stringify(direction);
					});

					flipped.objects.forEach(o => {
						if (!o.fog) {
							if (flipped.flipX)
								o.x = r.x + r.width - (o.x - r.x + (o.width || 0)) - 1;
							if (flipped.flipY)
								o.y = r.y + r.height - (o.y - r.y + (o.height || 0)) - 1;
							if (flipped.rotate) {
								let t = o.x;
								o.x = r.x + (o.y - r.y);
								o.y = r.y + (t - r.x);
							}
						} else {
							if (flipped.flipX) {
								const newArea = o.area.map(p => {
									const [ px, py ] = p;

									const hpx = r.width - px;

									return [hpx, py];
								});

								Object.assign(o, {
									area: newArea
								});
							}
							if (flipped.flipY) {
								const newArea = o.area.map(p => {
									const [ px, py ] = p;

									const hpy = r.height - py;

									return [px, hpy];
								});

								Object.assign(o, {
									area: newArea
								});
							}
							if (flipped.rotate) {
								const newArea = o.area.map(p => {
									const [ px, py ] = p;

									const t = px;
									const hpx = py;
									const hpy = t;

									return [hpx, hpy];
								});

								Object.assign(o, {
									area: newArea
								});
							}

							//Fix polygon bounds
							let lowX = r.width;
							let lowY = r.height;
							let highX = 0;
							let highY = 0;

							o.area.forEach(p => {
								const [ px, py ] = p;

								if (px < lowX)
									lowX = px;
								if (px > highX)
									highX = px;

								if (py < lowY)
									lowY = py;
								if (py > highY)
									highY = py;
							});

							o.x = lowX;
							o.y = lowY;
							o.width = highX - lowX;
							o.height = highY - lowY;
						}
					});

					if (flipped.rotate) {
						let t = flipped.width;
						flipped.width = flipped.height;
						flipped.height = t;
					}

					templates.push(flipped);
				}
			}
		}
	});

	templates.forEach(r => {
		let rotate = r.rotate;
		let w = rotate ? r.height : r.width;
		let h = rotate ? r.width : r.height;

		r.map = _.get2dArray(r.width, r.height);
		r.tiles = _.get2dArray(r.width, r.height);
		r.collisionMap = _.get2dArray(r.width, r.height);
		r.oldExits = extend([], r.exits);

		for (let i = 0; i < w; i++) {
			for (let j = 0; j < h; j++) {
				let ii = rotate ? j : i;
				let jj = rotate ? i : j;

				let x = r.flipX ? (r.x + w - i - 1) : (r.x + i);
				let y = r.flipY ? (r.y + h - j - 1) : (r.y + j);

				r.map[ii][jj] = map.oldMap[x][y];
				r.tiles[ii][jj] = map.oldLayers.tiles[x][y];
				r.collisionMap[ii][jj] = map.oldCollisionMap[x][y];
			}
		}
	});
};
