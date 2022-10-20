const setupConnection = require('./setupConnection');
const doesCollide = require('./doesCollide');

const buildRoom = (scope, template, connectTo, templateExit, connectToExit, isHallway) => {
	const { rooms, leafConstraints, randInt } = scope;

	let room = {
		x: 0,
		y: 0,
		distance: 0,
		isHallway: isHallway,
		template: extend({}, template),
		connections: []
	};

	if (connectTo) {
		room.x = connectTo.x + connectToExit.x - connectTo.template.x + (template.x - templateExit.x);
		room.y = connectTo.y + connectToExit.y - connectTo.template.y + (template.y - templateExit.y);
		room.distance = connectTo.distance + 1;
		room.parent = connectTo;
	}

	if (doesCollide(scope, room, connectTo))
		return false;

	if (connectTo)
		connectTo.connections.push(room);

	rooms.push(room);

	scope.updateBounds(room);

	if (room.distance < leafConstraints.maxDistance) {
		const maxExits = room.template.exits.length;
		const minExits = Math.min(maxExits, 2);

		const count = randInt(minExits, maxExits + 1);

		for (let i = 0; i < count; i++) 
			setupConnection(scope, room, !isHallway, buildRoom);
	}

	if ((isHallway) && (room.connections.length === 0)) {
		rooms.spliceWhere(r => r === room);
		room.parent.connections.spliceWhere(c => c === room);
		return false;
	}

	return room;
};

module.exports = buildRoom;
