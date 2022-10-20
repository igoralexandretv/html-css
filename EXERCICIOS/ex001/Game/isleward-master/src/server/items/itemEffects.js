let events = require('../misc/events');

let list = {

};

module.exports = {
	init: function () {
		events.emit('onBeforeGetItemEffectList', list);
	},

	get: function (name) {
		let res = list[name];

		if (!res)
			return 'config/itemEffects/' + name;

		return res;
	}
};
