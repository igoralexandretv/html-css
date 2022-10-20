const route = function (socket, msg) {
	const source = this.players.find(p => p.socket.id === socket.id);
	if (!source)
		return;

	if (!msg.data)
		msg.data = {};

	msg.data.sourceId = source.id;

	if (
		(
			(source.permadead) &&
			(['getCharacterList', 'getCharacter', 'deleteCharacter'].indexOf(msg.method) === -1)
		) ||
		(
			source.dead &&
			!(
				(msg.method === 'performAction' && ['respawn'].includes(msg.data.method)) ||
				(msg.method === 'clientAck')
			)
		)
	)
		return;

	if (msg.threadModule) {
		if (msg.callback)
			msg.data.callbackId = atlas.registerCallback(msg.callback);

		atlas.send(source.zoneId, msg);

		return;
	}

	let target = source;
	if (msg.data.targetId !== undefined && msg.data.cpn === undefined) {
		target = this.players.find(p => p.id === msg.data.targetId);
		if (!target)
			return;
	}

	let cpn = target[msg.cpn];
	if (!cpn)
		return;

	let method = msg.method;
	if (cpn[method])
		cpn[method](msg);
};

const routeGlobal = function (msg) {
	global[msg.module][msg.method](msg);
};

module.exports = {
	route,
	routeGlobal
};
