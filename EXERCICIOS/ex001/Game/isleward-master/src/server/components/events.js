module.exports = {
	type: 'events',

	list: [],

	simplify: function (self) {
		if (!self)
			return;

		let result = {
			type: 'events'
		};

		if (this.list.length > 0) {
			result.list = this.list.map(l => ({
				id: l.id,
				name: l.config.name,
				description: l.config.description
			}));
		}

		return result;
	},

	save: function () {
		return {
			type: 'events'
		};
	},

	simplifyTransfer: function () {
		return this.save();
	},

	unregisterEvent: function (event) {
		this.list.spliceWhere(l => (l === event));

		this.obj.syncer.setArray(true, 'events', 'removeList', {
			id: event.id
		});
	},

	syncList: function () {
		this.list.forEach(function (l) {
			this.obj.syncer.setArray(true, 'events', 'updateList', {
				id: l.id,
				name: l.config.name,
				description: l.config.description
			});
		}, this);
	},

	events: {
		afterMove: function () {
			let events = this.obj.instance.events;
			let closeEvents = events.getCloseEvents(this.obj);
			if (!closeEvents)
				return;

			closeEvents.forEach(function (c) {
				if (this.list.some(l => (l === c)))
					return;

				this.list.push(c);

				this.obj.syncer.setArray(true, 'events', 'updateList', {
					id: c.id,
					name: c.config.name,
					description: c.config.description
				});
			}, this);
		}
	}
};
