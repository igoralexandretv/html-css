const spawners = require('../spawners');

const spawnObjects = (scope, instance, room) => {
	let template = room.template;
	let spawnCd = instance.map.mapFile.properties.spawnCd;

	template.objects.forEach(o => {
		if (!o.fog) {
			o.x = o.x - template.x + room.x;
			o.y = o.y - template.y + room.y;

			spawners.register(o, spawnCd);
		} else {
			o.x += room.x;
			o.y += room.y;

			o.area = o.area.map(p => {
				const [px, py] = p;

				return [px + room.x, py + room.y];
			});

			instance.map.clientMap.hiddenRooms.push(o);
		}
	});

	room.connections.forEach(c => spawnObjects(scope, instance, c));
};

module.exports = spawnObjects;
