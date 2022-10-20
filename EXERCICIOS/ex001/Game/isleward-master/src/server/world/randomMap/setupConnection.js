module.exports = (scope, fromRoom, isHallway, buildRoom) => {
	const { templates, rooms, leafConstraints, randInt } = scope;

	if (!fromRoom.template.exits.length)
		return true;

	let fromExit = fromRoom.template.exits.splice(randInt(0, fromRoom.template.exits.length), 1)[0];
	let exitDirection = JSON.parse(fromExit.properties.exit);
	let allowedTemplates = templates.filter(t => {
		if (
			(t.properties.mapping) ||
				(!!t.properties.hallway !== isHallway) ||
				(t.properties.start) ||
				(
					(t.properties.end) &&
					(fromRoom.distance + 1 !== leafConstraints.maxDistance)
				)
		)
			return false;
			
		let isValid = t.exits.some(e => {
			let direction = JSON.parse(e.properties.exit);
			return ((direction[0] === -exitDirection[0]) && (direction[1] === -exitDirection[1]));
		});

		if ((isValid) && (t.properties.maxOccur)) {
			let occurs = rooms.some(r => (r.template.typeId === t.typeId));
			if (occurs >= ~~t.properties.maxOccur)
				isValid = false;
		}

		if ((isValid) && (fromRoom.distance + 1 === leafConstraints.maxDistance)) {
			//If there is an exit available, rather use that
			if (!t.properties.end) {
				let endsAvailable = templates.some(tt => {
					if (!tt.properties.end)
						return false;
					else if (!~~tt.properties.maxOccur)
						return true;
					else if (rooms.filter(r => r.template.typeId === tt.typeId).length < ~~tt.properties.maxOccur)
						return true;
				});

				if (endsAvailable)
					isValid = false;
			}
		}

		return isValid;
	});

	if (allowedTemplates.length === 0) {
		fromRoom.template.exits.push(fromExit);
		return false;
	}

	let template = extend({}, allowedTemplates[randInt(0, allowedTemplates.length)]);

	let templateExit = template.exits.filter(e => {
		let direction = JSON.parse(e.properties.exit);
		return ((direction[0] === -exitDirection[0]) && (direction[1] === -exitDirection[1]));
	});
	templateExit = templateExit[randInt(0, templateExit.length)];
	let exitIndex = template.exits.findIndex(e => e === templateExit);

	template.exits.splice(exitIndex, 1);

	let success = buildRoom(scope, template, fromRoom, templateExit, fromExit, isHallway);
	if (!success) {
		fromRoom.template.exits.push(fromExit);
		return false;
	}

	return true;
};
