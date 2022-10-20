const events = require('../misc/events');

const restEndpoints = {
	info: require('./restEndpoints/info.js'),
	adminForceSave: require('./restEndpoints/forceSaveAll.js')
};

module.exports = {
	init: async function (app) {
		events.emit('onBeforeRegisterRestEndpoints', restEndpoints);

		Object.entries(restEndpoints).forEach(e => {
			const [ route, handler ] = e;

			app.get(`/${route}`, handler);
		});
	},

	willHandle: function (url) {
		return Object.keys(restEndpoints).some(k => url.includes(`/${k}`));
	}
};
