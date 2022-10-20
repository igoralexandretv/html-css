let events = require('../misc/events');

module.exports = {
	mappings: {

	},

	init: function () {
		events.emit('onBeforeGetFactions', this.mappings);
	},

	getFaction: function (id) {
		let mapping = this.mappings[id];
		let faction = null;
		if (mapping)
			faction = require('./' + mapping);
		else
			faction = require('./factions/' + id);

		return faction;
	}
};
