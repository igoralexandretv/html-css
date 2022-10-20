module.exports = async (cpnSocial, eventName) => {
	atlas.messageAllThreads({
		threadModule: 'eventManager',
		method: 'startEventByCode',
		data: eventName
	});
};
