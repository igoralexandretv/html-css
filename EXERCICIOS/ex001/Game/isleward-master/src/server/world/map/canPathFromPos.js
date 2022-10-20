let objects = require('../../objects/objects');
let physics = require('../physics');

const canPath = (pos, positions, maxDistance = 0) => {
	return positions.some(p => {
		const path = physics.getPath(pos, p);
		//Are we on the position?
		if (!path.length) 
			return (p.x === pos.x && p.y === pos.y);

		const { x, y } = path[path.length - 1];
		//Can we get close enough to the position?
		const isCloseEnough = Math.max(Math.abs(p.x - x), Math.abs(p.y - y)) <= maxDistance;
		if (isCloseEnough) 
			return true;

		return false;
	});
};

module.exports = (map, pos) => {
	const canPathToSpawn = canPath(pos, map.spawn);

	if (canPathToSpawn)
		return true;

	const portals = objects.objects.filter(o => o.portal);
	const canPathToPortal = canPath(pos, portals);

	if (canPathToPortal)
		return true;

	const doors = objects.objects.filter(o => o.door);
	const canPathToDoor = canPath(pos, doors, 1);

	return canPathToDoor;
};
