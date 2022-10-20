const drawRoom = require('./drawRoom');
const spawnObjects = require('./spawnObjects');

module.exports = (scope, instance, startRoom) => {
	const { bounds } = scope;

	let w = bounds[2] - bounds[0];
	let h = bounds[3] - bounds[1];

	let map = instance.map;
	let clientMap = map.clientMap;

	clientMap.map = _.get2dArray(w, h);
	clientMap.collisionMap = _.get2dArray(w, h, 1);

	let startTemplate = startRoom.template;
	map.spawn = [{
		x: startRoom.x + ~~(startTemplate.width / 2),
		y: startRoom.y + ~~(startTemplate.height / 2)
	}];

	drawRoom(scope, instance, startRoom);

	instance.physics.init(clientMap.collisionMap);

	spawnObjects(scope, instance, startRoom);
};
