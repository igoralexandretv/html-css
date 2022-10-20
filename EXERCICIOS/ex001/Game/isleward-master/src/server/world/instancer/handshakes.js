//Local State
const stagedZoneIns = [];

//Methods

//Fired when an object is removed through a socket dc
// We do this because a client might DC during rezone handshake
const unstageZoneIn = msg => {
	stagedZoneIns.spliceWhere(s => s.obj.serverId === msg.obj.id);
};

const stageZoneIn = msg => {
	const { serverId } = msg.obj;

	stagedZoneIns.spliceWhere(o => o.obj.serverId === serverId);

	stagedZoneIns.push(msg);
};

const doZoneIn = function (staged) {
	const { onAddObject, instances: [ { objects, questBuilder, eventEmitter } ] } = instancer;

	const { transfer: isTransfer, obj } = staged;

	if (!isTransfer)
		objects.addObject(obj, onAddObject.bind(instancer));
	else {
		let o = objects.transferObject(obj);
		questBuilder.obtain(o);
		eventEmitter.emit('onAfterPlayerEnterZone', o, { isTransfer });
	}
};

const clientAck = msg => {
	const staged = stagedZoneIns.find(s => s.obj.serverId === msg.sourceId);
	if (!staged)
		return;

	stagedZoneIns.spliceWhere(s => s === staged);

	doZoneIn(staged);
};

//Exports
module.exports = {
	unstageZoneIn,
	stageZoneIn,
	clientAck
};
