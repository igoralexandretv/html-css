const generateMappings = require('./generateMappings');
const isValidDungeon = require('./isValidDungeon');
const setupTemplates = require('./setupTemplates');
const buildRoom = require('./buildRoom');
const buildMap = require('./buildMap');

module.exports = {
	instance: null,

	templates: null,
	tileMappings: null,
	rooms: [],
	exitAreas: [],

	leafConstraints: {
		minDistance: 4,
		maxDistance: 12,
		minCount: 3,
		maxCount: 7
	},

	endConstraints: {
		minDistance: 10,
		maxDistance: 12
	},

	bounds: [0, 0, 0, 0],

	init: function (instance) {
		this.instance = instance;

		const { map } = instance;

		this.loadMapProperties(map.mapFile.properties);

		this.templates = extend([], map.rooms);
		setupTemplates(this, map);
		generateMappings(this, map);
	},

	generate: function () {
		const { instance } = this;

		const { map } = instance;
		map.clientMap.hiddenRooms = [];

		this.rooms = [];
		this.exitAreas = [];
		this.bounds = [0, 0, 0, 0];

		const hasEndRoom = this.templates.some(t => t.properties.end);
		if (!hasEndRoom) {
			/* eslint-disable-next-line no-console */
			console.log(`Random map has no end room defined: ${map.name}`);

			return;
		}

		let startTemplate = this.templates.filter(t => t.properties.start);
		startTemplate = startTemplate[this.randInt(0, startTemplate.length)];

		let startRoom = buildRoom(this, startTemplate);

		if (!isValidDungeon(this))
			return false;

		this.offsetRooms(startRoom);
		buildMap(this, instance, startRoom);

		//To spawn in another room
		/*const spawnRoom = this.rooms.find(t => t.template.properties.end);
		map.spawn = [{
			x: spawnRoom.x + ~~(spawnRoom.template.width / 2) - 2,
			y: spawnRoom.y + ~~(spawnRoom.template.height / 2) + 6
		}];*/

		return true;
	},

	loadMapProperties: function ({ leafConstraints, endConstraints }) {
		if (leafConstraints)
			this.leafConstraints = JSON.parse(leafConstraints);

		if (endConstraints)
			this.endConstraints = JSON.parse(endConstraints);
	},

	randomizeTile: function (tile, floorTile) {
		let mapping = this.tileMappings[tile];
		if (!mapping)
			return tile;

		tile = mapping[this.randInt(0, mapping.length)];
		if (!tile)
			return 0;

		return tile;
	},

	offsetRooms: function (room) {
		let bounds = this.bounds;
		let dx = (this.bounds[0] < 0) ? -bounds[0] : 0;
		let dy = (this.bounds[1] < 0) ? -bounds[1] : 0;

		this.performOffset(room, dx, dy);

		this.bounds = [bounds[0] + dx, bounds[1] + dy, bounds[2] + dx, bounds[3] + dy];
	},

	performOffset: function (room, dx, dy) {
		room.x += dx;
		room.y += dy;

		room.connections.forEach(c => this.performOffset(c, dx, dy));
	},

	updateBounds: function (room) {
		this.bounds[0] = Math.min(this.bounds[0], room.x);
		this.bounds[1] = Math.min(this.bounds[1], room.y);
		this.bounds[2] = Math.max(this.bounds[2], room.x + room.template.width);
		this.bounds[3] = Math.max(this.bounds[3], room.y + room.template.height);
	},

	randInt: function (min, max) {
		return ~~(Math.random() * (max - min)) + min;
	}
};
