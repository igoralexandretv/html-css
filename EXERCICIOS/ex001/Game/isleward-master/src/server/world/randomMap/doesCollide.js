module.exports = (scope, room, ignore) => {
	const { rooms } = scope;

	for (let i = 0; i < rooms.length; i++) {
		let r = rooms[i];
		if (r === ignore)
			continue;

		let collides = (!(
			(room.x + room.template.width < r.x) ||
				(room.y + room.template.height < r.y) ||
				(room.x >= r.x + r.template.width) ||
				(room.y >= r.y + r.template.height)
		));
		if (collides)
			return true;
	}

	return false;
};
