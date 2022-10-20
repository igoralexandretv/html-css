module.exports = async (cpnSocial, targetName) => {
	const { obj } = cpnSocial;
	const { instance: { objects, physics }, syncer } = obj;

	const target = objects.find(o => o.name && o.name.toLowerCase().includes(targetName.toLowerCase()));

	if (!target)
		return;

	physics.removeObject(obj, obj.x, obj.y);

	obj.x = target.x;
	obj.y = target.y;

	physics.addObject(obj, obj.x, obj.y);

	syncer.o.x = obj.x;
	syncer.o.y = obj.y;
};
