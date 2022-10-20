let events = require('../../misc/events');

let config = [
	{
		name: 'cave',
		path: 'config/maps'
	},
	{
		name: 'fjolarok',
		path: 'config/maps'
	}
];

module.exports = {
	init: function () {
		events.emit('onBeforeGetMapList', config);
		this.mapList = config;
	}
};
