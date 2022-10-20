const ua = require('universal-analytics');

//eslint-disable-next-line no-process-env
const analyticsId = process.env.IWD_GOOGLE_ANALYTICS_ID;

const tracker = {
	id: null,
	ga: null,

	init: function (userId) {
		this.id = userId;
		this.ga = ua(analyticsId, userId, { strictCidFormat: false });
	},

	track: function ({ category, action, label, value }) {
		this.ga.event(category, action, label, value).send();
	}
};

const fakeTracker = {
	track: function () {}
};

module.exports = {
	connect: function (id) {
		if (!analyticsId)
			return fakeTracker;

		const builtTracker = extend({}, tracker);
		builtTracker.init(id);

		return builtTracker;
	}
};
