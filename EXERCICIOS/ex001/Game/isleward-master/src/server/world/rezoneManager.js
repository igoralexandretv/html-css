//Imports
const eventEmitter = require('../misc/events');

//Local State
const stagedRezones = [];

//Methods

//Fired when an object is removed through a socket dc
// We do this because a client might DC during rezone handshake
const unstageRezone = msg => {
	stagedRezones.spliceWhere(s => s.simplifiedObj.serverId === msg.obj.id);
};

const stageRezone = (simplifiedObj, targetZone) => {
	const { serverId } = simplifiedObj;

	stagedRezones.spliceWhere(o => o.simplifiedObj.serverId === serverId);

	stagedRezones.push({ simplifiedObj, targetZone });
};

const doRezone = stagedRezone => {
	const { simplifiedObj, targetZone } = stagedRezone;

	process.send({
		method: 'rezone',
		id: simplifiedObj.serverId,
		args: {
			obj: simplifiedObj,
			newZone: targetZone
		}
	});
};

const clientAck = msg => {
	const staged = stagedRezones.find(s => s.simplifiedObj.serverId === msg.sourceId);
	if (!staged) 
		return;

	stagedRezones.spliceWhere(s => s === staged);

	doRezone(staged);
};

const init = () => {
	eventEmitter.on('removeObject', unstageRezone);
};

//Exports
module.exports = {
	init,
	stageRezone,
	clientAck
};
