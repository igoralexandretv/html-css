let pathfinder = require('../misc/pathfinder');

let sqrt = Math.sqrt.bind(Math);
let ceil = Math.ceil.bind(Math);
let mathRand = Math.random.bind(Math);

module.exports = {
	graph: null,

	collisionMap: null,
	cells: [],
	width: 0,
	height: 0,

	init: function (collisionMap) {
		this.collisionMap = collisionMap;

		this.width = collisionMap.length;
		this.height = collisionMap[0].length;

		this.cells = _.get2dArray(this.width, this.height, 'array');

		this.graph = new pathfinder.Graph(collisionMap, {
			diagonal: true
		});
	},

	addRegion: function (obj) {
		let lowX = obj.x;
		let lowY = obj.y;
		let highX = lowX + obj.width;
		let highY = lowY + obj.height;
		let cells = this.cells;

		for (let i = lowX; i < highX; i++) {
			let row = cells[i];
			for (let j = lowY; j < highY; j++) {
				let cell = row[j];

				if (!cell)
					continue;

				let cLen = cell.length;
				for (let k = 0; k < cLen; k++) {
					let c = cell[k];

					c.collisionEnter(obj);
					obj.collisionEnter(c);
				}

				cell.push(obj);
			}
		}
	},

	removeRegion: function (obj) {
		let oId = obj.id;

		let lowX = obj.x;
		let lowY = obj.y;
		let highX = lowX + obj.width;
		let highY = lowY + obj.height;
		let cells = this.cells;

		for (let i = lowX; i < highX; i++) {
			let row = cells[i];
			for (let j = lowY; j < highY; j++) {
				let cell = row[j];

				if (!cell)
					continue;

				let cLen = cell.length;
				for (let k = 0; k < cLen; k++) {
					let c = cell[k];

					if (c.id !== oId) {
						c.collisionExit(obj);
						obj.collisionExit(c);
					} else {
						cell.splice(k, 1);
						k--;
						cLen--;
					}
				}
			}
		}
	},

	addObject: function (obj, x, y, fromX, fromY) {
		let row = this.cells[x];

		if (!row)
			return;

		let cell = row[y];

		if (!cell)
			return;

		let cLen = cell.length;
		for (let i = 0; i < cLen; i++) {
			let c = cell[i];

			//If we have fromX and fromY, check if the target cell doesn't contain the same obj (like a notice area)
			if ((c.width) && (fromX)) {
				if (c.area) {
					if ((this.isInPolygon(x, y, c.area)) && (!this.isInPolygon(fromX, fromY, c.area))) {
						c.collisionEnter(obj);
						obj.collisionEnter(c);
					}
				} else if ((fromX < c.x) || (fromY < c.y) || (fromX >= c.x + c.width) || (fromY >= c.y + c.height)) {
					c.collisionEnter(obj);
					obj.collisionEnter(c);
				}
			} else {
				//If a callback returns true, it means we collide
				if (c.collisionEnter(obj))
					return;
				obj.collisionEnter(c);
			}
		}

		//Perhaps a collisionEvent caused us to move somewhere else, in which case, we don't push to the cell
		// as we assume that the collisionEvent handled it for us
		if (obj.x === x && obj.y === y)
			cell.push(obj);
		
		return true;
	},

	removeObject: function (obj, x, y, toX, toY) {
		let row = this.cells[x];

		if (!row)
			return;

		let cell = row[y];

		if (!cell)
			return;

		let oId = obj.id;
		let cLen = cell.length;
		for (let i = 0; i < cLen; i++) {
			let c = cell[i];

			if (c.id !== oId) {
				//If we have toX and toY, check if the target cell doesn't contain the same obj (like a notice area)
				if ((c.width) && (toX)) {
					if (c.area) {
						if ((this.isInPolygon(x, y, c.area)) && (!this.isInPolygon(toX, toY, c.area))) {
							c.collisionExit(obj);
							obj.collisionExit(c);
						}
					} else if ((toX < c.x) || (toY < c.y) || (toX >= c.x + c.width) || (toY >= c.y + c.height)) {
						c.collisionExit(obj);
						obj.collisionExit(c);
					}
				} else {
					c.collisionExit(obj);
					obj.collisionExit(c);
				}
			} else {
				cell.splice(i, 1);
				i--;
				cLen--;
			}
		}
	},

	isValid: function (x, y) {
		let row = this.cells[x];

		if ((!row) || (row.length <= y) || (!this.graph.grid[x][y]))
			return false;
		return true;
	},

	getCell: function (x, y) {
		let row = this.cells[x];

		if (!row)
			return [];

		let cell = row[y];

		if (!cell)
			return [];

		return cell;
	},
	getArea: function (x1, y1, x2, y2, filter) {
		let width = this.width;
		let height = this.height;

		x1 = ~~x1;
		y1 = ~~y1;

		x2 = ~~x2;
		y2 = ~~y2;

		if (x1 < 0)
			x1 = 0;
		if (x2 >= width)
			x2 = width - 1;
		if (y1 < 0)
			y1 = 0;
		if (y2 >= height)
			y2 = height - 1;

		let cells = this.cells;
		let grid = this.graph.grid;

		let result = [];
		for (let i = x1; i <= x2; i++) {
			let row = cells[i];
			let gridRow = grid[i];
			for (let j = y1; j <= y2; j++) {
				if (!gridRow[j])
					continue;

				let cell = row[j];
				let cLen = cell.length;
				for (let k = 0; k < cLen; k++) {
					let c = cell[k];

					if (filter) {
						if (filter(c))
							result.push(c);
					} else
						result.push(c);
				}
			}
		}

		return result;
	},

	getOpenCellInArea: function (x1, y1, x2, y2) {
		let width = this.width;
		let height = this.height;

		x1 = ~~x1;
		y1 = ~~y1;

		x2 = ~~x2;
		y2 = ~~y2;

		if (x1 < 0)
			x1 = 0;
		else if (x2 >= width)
			x2 = width - 1;
		if (y1 < 0)
			y1 = 0;
		else if (y2 >= height)
			y2 = height - 1;

		let cells = this.cells;
		let grid = this.graph.grid;

		for (let i = x1; i <= x2; i++) {
			let row = cells[i];
			let gridRow = grid[i];
			for (let j = y1; j <= y2; j++) {
				if (!gridRow[j])
					continue;

				let cell = row[j];
				if (cell.length === 0) {
					return {
						x: i,
						y: j
					};
				} 
				//If the only contents are notices, we can still use it
				let allNotices = !cell.some(c => !c.notice);
				if (allNotices) {
					return {
						x: i,
						y: j
					};
				}
			}
		}

		return null;
	},

	getPath: function (from, to) {
		let graph = this.graph;
		let grid = graph.grid;

		if (!to) {
			to = {
				x: ~~(mathRand() * grid.length),
				y: ~~(mathRand() * grid[0].length)
			};
		}

		let fromX = ~~from.x;
		let fromY = ~~from.y;

		if ((!grid[fromX]) || (grid[fromX].length <= fromY) || (fromX < 0) || (fromY < 0))
			return [];

		let toX = ~~to.x;
		let toY = ~~to.y;

		if ((!grid[toX]) || (grid[toX].length <= toY) || (toX < 0) || (toY < 0))
			return [];

		let path = pathfinder.astar.search(graph, {
			x: fromX,
			y: fromY
		}, {
			x: toX,
			y: toY
		}, {
			closest: true
		});

		return path;
	},
	isTileBlocking: function (x, y) {
		if ((x < 0) || (y < 0) || (x >= this.width) | (y >= this.height))
			return true;

		x = ~~x;
		y = ~~y;

		let node = this.graph.grid[x][y];
		if (node)
			return (node.weight === 0);
		return true;
	},
	isCellOpen: function (x, y) {
		if ((x < 0) || (y < 0) || (x >= this.width) | (y >= this.height))
			return true;

		let cells = this.cells[x][y];
		let cLen = cells.length;
		for (let i = 0; i < cLen; i++) {
			let c = cells[i];
			if (!c.notice)
				return false;
		}

		return true;
	},
	hasLos: function (fromX, fromY, toX, toY) {
		if ((fromX < 0) || (fromY < 0) || (fromX >= this.width) | (fromY >= this.height) || (toX < 0) || (toY < 0) || (toX >= this.width) | (toY >= this.height))
			return false;

		let graphGrid = this.graph.grid;

		if ((!graphGrid[fromX][fromY]) || (!graphGrid[toX][toY]))
			return false;

		let dx = toX - fromX;
		let dy = toY - fromY;

		let distance = sqrt((dx * dx) + (dy * dy));

		dx /= distance;
		dy /= distance;

		fromX += 0.5;
		fromY += 0.5;

		distance = ceil(distance);

		let x = 0;
		let y = 0;

		for (let i = 0; i < distance; i++) {
			fromX += dx;
			fromY += dy;

			x = ~~fromX;
			y = ~~fromY;

			let node = graphGrid[x][y];

			if ((!node) || (node.weight === 0))
				return false;
			else if ((x === toX) && (y === toY))
				return true;
		}

		return true;
	},

	getClosestPos: function (fromX, fromY, toX, toY, target, obj) {
		let tried = {};

		let hasLos = this.hasLos.bind(this, toX, toY);

		let width = this.width;
		let height = this.height;

		let collisionMap = this.collisionMap;
		let cells = this.cells;

		let reverseX = (fromX > toX);
		let reverseY = (fromY > toY);

		for (let c = 1; c <= 10; c++) {
			let x1 = toX - c;
			let y1 = toY - c;
			let x2 = toX + c;
			let y2 = toY + c;

			let lowX, lowY, highX, highY, incX, incY;

			if (reverseX) {
				incX = -1;
				lowX = x2;
				highX = x1 - 1;
			} else {
				incX = 1;
				lowX = x1;
				highX = x2 + 1;
			}

			if (reverseY) {
				incY = -1;
				lowY = y2;
				highY = y1 - 1;
			} else {
				incY = 1;
				lowY = y1;
				highY = y2 + 1;
			}

			for (let i = lowX; i !== highX; i += incX) {
				if ((i < 0) || (i >= width))
					continue;

				let row = collisionMap[i];
				let cellRow = cells[i];

				let t = tried[i];
				if (!t) 
					t = tried[i] = {};

				for (let j = lowY; j !== highY; j += incY) {
					if (t[j])
						continue;

					t[j] = 1;

					if (
						((i === toX) && (j === toY)) ||
						((j < 0) || (j >= height)) ||
						(row[j])
					)
						continue;

					if (target && obj) {
						let cell = cellRow[j];
						if (this.mobsCollide(i, j, obj, target, cell))
							continue;
					}

					if (!hasLos(i, j))
						continue;

					return {
						x: i,
						y: j
					};
				}
			}
		}
	},

	//If we pass through a cell it means we want to move to this location but need to check aggro
	mobsCollide: function (x, y, obj, target, cell) {
		const allowOne = !cell;

		if (!cell) {
			if (x < 0 || y < 0 || x >= this.width | y >= this.height)
				return true;

			cell = this.cells[x][y];
		}

		let cLen = cell.length;

		if (allowOne && cLen === 1)
			return false;
		else if (target.x === x && target.y === y)
			return true;

		for (let i = 0; i < cLen; i++) {
			let c = cell[i];
			//If we're first in the cell, we get preference
			if (c === obj)
				return false;
			else if (!c.aggro)
				continue;
			else if (c.aggro.hasAggroOn(target) || obj.aggro.hasAggroOn(c)) 
				return true;
		}

		return false;
	},

	setCollision: function (x, y, collides) {
		this.collisionMap[x][y] = collides ? 1 : 0;

		let grid = this.graph.grid;
		if (!grid[x][y]) 
			grid[x][y] = new pathfinder.gridNode(x, y, collides ? 0 : 1);
		else {
			grid[x][y].weight = collides ? 0 : 1;
			pathfinder.astar.cleanNode(grid[x][y]);
		}
	},

	isInPolygon: function (x, y, verts) {
		let inside = false;

		let vLen = verts.length;
		for (let i = 0, j = vLen - 1; i < vLen; j = i++) {
			let vi = verts[i];
			let vj = verts[j];

			let xi = vi[0];
			let yi = vi[1];
			let xj = vj[0];
			let yj = vj[1];

			let doesIntersect = (
				((yi > y) !== (yj > y)) &&
					(x < ((((xj - xi) * (y - yi)) / (yj - yi)) + xi))
			);

			if (doesIntersect)
				inside = !inside;
		}

		return inside;
	}
};
