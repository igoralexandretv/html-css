module.exports = {
	rewards: [],

	init: function (hideMessage) {
		if (!this.build())
			return false;

		if (!this.xp) {
			let level = this.obj.instance.zoneConfig.level;
			level = level[0];
			let xp = ~~(level * 22 * this.getXpMultiplier());
			this.xp = xp;
		}

		this.obj.syncer.setArray(true, 'quests', 'obtainQuests', this.simplify(true));

		if (!hideMessage) {
			const message = `Quest obtained (${this.name})`;
			this.obj.social.notifySelf({
				message,
				className: 'color-yellowB'
			});
		}

		return true;
	},

	ready: function () {
		this.isReady = true;

		if (this.oReady)
			this.oReady();

		const message = `Quest ready for turn-in (${this.name})`;
		this.obj.social.notifySelf({
			message,
			className: 'color-yellowB'
		});

		this.obj.syncer.setArray(true, 'quests', 'updateQuests', this.simplify(true));
		this.obj.fireEvent('onQuestReady', this);
	},

	complete: function () {
		if (this.oComplete)
			this.oComplete();

		const obj = this.obj;

		obj.instance.eventEmitter.emit('beforeCompleteAutoquest', this, obj);

		const message = `Quest completed (${this.name})`;
		obj.social.notifySelf({
			message,
			className: 'color-yellowB'
		});

		obj.syncer.setArray(true, 'quests', 'completeQuests', this.id);

		obj.instance.eventEmitter.emit('onCompleteQuest', this);

		this.rewards.forEach(reward => obj.inventory.getItem(reward));

		obj.stats.getXp(this.xp || 10, obj, this);
	},

	simplify: function (self) {
		let values = {};
		for (let p in this) {
			let value = this[p];
			if (typeof (value) === 'function' || ['obj', 'events'].includes(p))
				continue;

			values[p] = value;
		}

		return values;
	}
};
