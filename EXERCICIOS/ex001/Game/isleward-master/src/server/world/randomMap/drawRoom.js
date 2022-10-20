const drawRoom = (scope, instance, room) => {
	const { exitAreas } = scope;

	let map = instance.map.clientMap.map;
	let template = room.template;
	let collisionMap = instance.map.clientMap.collisionMap;

	for (let i = 0; i < template.width; i++) {
		let x = room.x + i;
		for (let j = 0; j < template.height; j++) {
			let y = room.y + j;

			let tile = template.map[i][j];
			if (!tile)
				continue;

			let currentTile = map[x][y];
			let collides = template.collisionMap[i][j];
			let floorTile = template.tiles[i][j];

			if (!currentTile) {
				let cell = tile.split(',');
				let cLen = cell.length;

				let newCell = '';
				for (let k = 0; k < cLen; k++) {
					let c = cell[k];
					let newC = scope.randomizeTile(c);
					newCell += newC;

					if (k < cLen - 1)
						newCell += ',';
				}

				map[x][y] = newCell;

				collisionMap[x][y] = collides;
				continue;
			} else {
				//Remove objects from this position since it falls in another room
				template.objects.spliceWhere(o => {
					let ox = o.x - template.x + room.x;
					let oy = o.y - template.y + room.y;
					return ((ox === x) && (oy === y));
				});
			}

			let didCollide = collisionMap[x][y];
			if (collides) {
				if (didCollide) {
					let isExitTile = exitAreas.find(e => {
						return (!((x < e.x) || (y < e.y) || (x >= e.x + e.width) || (y >= e.y + e.height)));
					});
					if (isExitTile) {
						let isThisExit = template.oldExits.find(e => {
							let ex = room.x + (e.x - template.x);
							let ey = room.y + (e.y - template.y);
							return (!((x < ex) || (y < ey) || (x >= ex + e.width) || (y >= ey + e.height)));
						});
						if (isThisExit) {
							map[x][y] = scope.randomizeTile(floorTile);
							collisionMap[x][y] = false;
						} else
							collisionMap[x][y] = true;
					}
				}
			} else if (didCollide) {
				collisionMap[x][y] = false;
				map[x][y] = scope.randomizeTile(floorTile);
			}
		}
	}

	template.oldExits.forEach(e => {
		exitAreas.push({
			x: room.x + (e.x - template.x),
			y: room.y + (e.y - template.y),
			width: e.width,
			height: e.height
		});
	});

	room.connections.forEach(c => drawRoom(scope, instance, c));
};

module.exports = drawRoom;
