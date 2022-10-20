module.exports = {
	type: 'quests',
	quests: [],

	init: function (blueprint) {
		let quests = blueprint.quests || [];
		let qLen = quests.length;
		for (let i = 0; i < qLen; i++) {
			let q = quests[i];

			this.obj.instance.questBuilder.obtain(this.obj, q);
		}

		delete blueprint.quests;
		this.blueprint = blueprint;
	},

	transfer: function () {
		let blueprint = {
			quests: this.quests
		};
		this.quests = [];
		this.init(blueprint);
	},

	obtain: function (quest, hideMessage) {
		quest.active = (this.obj.zoneName === quest.zoneName);

		this.quests.push(quest);
		if (!quest.init(hideMessage)) {
			this.quests.spliceWhere(q => (q === quest));
			return false;
		}

		return true;
	},

	complete: function ({ questId }) {
		let quest = this.quests.find(q => q.id === questId);
		if ((!quest) || (!quest.isReady))
			return;

		this.obj.auth.track('quest', 'complete', quest.name);

		quest.complete();

		this.quests.spliceWhere(q => q === quest);

		this.obj.instance.questBuilder.obtain(this.obj);
	},

	fireEvent: function (event, args) {
		let quests = this.quests;
		let qLen = quests.length;
		for (let i = 0; i < qLen; i++) {
			let q = quests[i];
			if (!q) {
				qLen--;
				continue;
			} else if (q.completed)
				continue;

			let events = q.events;
			if (!events)
				continue;

			let callback = events[event];
			if (!callback)
				continue;

			callback.apply(q, args);
		}
	},

	simplify: function (self) {
		if (!self)
			return;

		let result = {
			type: 'quests'
		};

		result.quests = this.quests.map(q => {
			return q.simplify ? q.simplify(true) : q;
		});

		return result;
	}
};
