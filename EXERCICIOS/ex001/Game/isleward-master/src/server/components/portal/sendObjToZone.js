const fixPosition = (obj, toPos, toRelativePos, invokingObj) => {
	if (toPos) {
		obj.x = toPos.x;
		obj.y = toPos.y;
	} else if (toRelativePos) {
		obj.x = invokingObj.obj.x + toRelativePos.x;
		obj.y = invokingObj.obj.y + toRelativePos.y;
	}
};

const sendObjToZone = async ({ obj, invokingObj, zoneName, toPos, toRelativePos }) => {
	const { serverId, instance: { syncer: globalSyncer, physics } } = obj;

	if (obj.zoneName === zoneName) {
		globalSyncer.flushForTarget(serverId);

		physics.removeObject(obj, obj.x, obj.y);

		if (toRelativePos) {
			toPos = {
				x: invokingObj.obj.x + toRelativePos.x,
				y: invokingObj.obj.y + toRelativePos.y
			};
		}

		obj.x = toPos.x;
		obj.y = toPos.y;

		physics.addObject(obj, obj.x, obj.y);

		globalSyncer.queue('teleportToPosition', {
			x: obj.x,
			y: obj.y
		}, [obj.serverId]);

		return;
	}

	obj.fireEvent('beforeRezone');

	//We set this before saving so that objects aren't saved ON portals
	obj.zoneName = zoneName;
	fixPosition(obj, toPos, toRelativePos, invokingObj);

	//Destroy, flush events and notify other objects
	globalSyncer.processDestroyedObject(obj);
	await obj.auth.doSave();

	//We have to do this again. This is because onCollisionEnter in portal is not blocking (even though it is async)
	// So physics will carry on and allow the obj to move onto the next tile (changing the position while we save above)
	fixPosition(obj, toPos, toRelativePos, invokingObj);

	const simpleObj = obj.getSimple(true, false, true);
	simpleObj.destroyed = false;
	simpleObj.forceDestroy = false;

	rezoneManager.stageRezone(simpleObj, zoneName);

	process.send({
		method: 'events',
		data: {
			rezoneStart: [{
				obj: { msg: {} },
				to: [serverId]
			}]
		}
	});
};

module.exports = sendObjToZone;
