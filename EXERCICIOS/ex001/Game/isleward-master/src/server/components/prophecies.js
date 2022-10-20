module.exports = {
	type: 'prophecies',

	list: [],

	init: function (blueprint) {
		(blueprint.list || []).forEach(function (p) {
			let template = null;
			try {
				template = require('../config/prophecies/' + p);
			} catch (e) {}

			if (!template)
				return;
			else if (this.list.some(l => (l.type === p)))
				return;

			let prophecy = extend({}, template);
			prophecy.obj = this.obj;
			prophecy.init();

			this.list.push(prophecy);
		}, this);

		delete blueprint.list;
	},

	hasProphecy: function (type) {
		return this.list.some(l => (l.type === type));
	},

	transfer: function () {
		let transferList = this.list;
		this.list = [];

		this.init({
			list: transferList
		});
	},

	fireEvent: function (event, args) {
		let list = this.list;
		let lLen = list.length;
		for (let i = 0; i < lLen; i++) {
			let l = list[i];
			let events = l.events;
			if (!events)
				continue;

			let callback = events[event];
			if (!callback)
				continue;

			callback.apply(l, args);
		}
	},

	simplify: function (self) {
		let e = {
			type: 'prophecies'
		};

		if ((this.list.length > 0) && (this.list[0].simplify))
			e.list = this.list.map(p => p.simplify());
		else
			e.list = this.list;

		return e;
	}
};
