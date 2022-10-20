module.exports = async (cpnSocial, eventName) => {
	atlas.messageAllThreads({
		threadModule: 'eventManager',
		method: 'stopEventByCode',
		data: eventName
	});
};
