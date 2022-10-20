module.exports = cpnMob => {
	const { originX, originY, obj: { x, y, instance: { physics } } } = cpnMob;

	const path = physics.getPath({ x, y }, { x: originX, y: originY });
	if (!path.length) 
		return (x === originX && y === originY);

	const { x: px, y: py } = path[path.length - 1];
	const canReachHome = (px === originX && py === originY);

	return canReachHome;
};
