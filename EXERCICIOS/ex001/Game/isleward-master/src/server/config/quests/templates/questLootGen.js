const resetQuest = q => {
	q.mobName = null;
	q.mobType = null;
	q.item = null;
};

module.exports = {
	type: 'lootGen',

	need: 10,
	have: 0,

	mobType: null,
	mobName: null,
	item: null,

	build: function () {
		//If we're not in the correct zone, don't do this check, it'll just crash the server
		// since the mob won't be available (most likely) in the zoneFile
		if (this.obj.zoneName === this.zoneName) {
			let mobTypes = this.obj.instance.zoneConfig.mobs;

			if (this.mobType && this.item) {
				//Check if the zoneFile changed
				const mobBlueprint = mobTypes[this.mobType];
				if (!mobBlueprint || !mobBlueprint.questItem || mobBlueprint.questItem.name !== this.item.name)
					resetQuest(this);
			}

			if (!this.mobName || !this.item) {
				let keys = Object.keys(mobTypes).filter(function (m) {
					let mobBlueprint = mobTypes[m];

					return (
						(m !== 'default') &&
					(mobBlueprint.questItem) &&
					(mobBlueprint.level <= (this.obj.stats.values.level * 1.35))
					);
				}, this);

				//No level appropriate mobs found
				if (keys.length === 0)
					return false;

				this.mobType = keys[~~(Math.random() * keys.length)];
				let needMax = 8;
				this.mobName = this.mobType.replace(/\w\S*/g, function (txt) {
					return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
				});

				this.need = Math.max(1, ~~((needMax * 0.2) + (Math.random() * needMax * 0.8)));

				this.item = mobTypes[this.mobType].questItem || mobTypes.default.questItem;
			}
		}

		if (!this.item) {
			this.setAsync({
				key: new Date(),
				table: 'error',
				value: this.obj.name + ' ' + this.mobType
			});
		}

		this.name = this.item.name + ' Gatherer';
		this.description = 'Loot ' + this.have + '/' + this.need + ' ' + this.item.name + ' from ' + this.mobName;

		return true;
	},

	getXpMultiplier: function () {
		return (this.need * 1.5);
	},

	oComplete: function () {
		let inventory = this.obj.inventory;
		let item = inventory.items.find((i => i.name === this.item.name).bind(this));
		if (item)
			this.obj.inventory.destroyItem({ itemId: item.id }, this.need);
	},

	events: {
		beforeTargetDeath: function (target, dropItems) {
			if ((this.obj.zoneName !== this.zoneName) || (target.name.toLowerCase() !== this.mobType) || (this.have >= this.need))
				return;

			let roll = Math.random();
			if (roll < 0.5)
				return;

			dropItems.push({
				name: this.item.name,
				quality: 0,
				quantity: 1,
				quest: true,
				sprite: this.item.sprite,
				ownerName: this.obj.name
			});
		},

		afterLootMobItem: function (item) {
			if ((this.obj.zoneName !== this.zoneName) || (item.name.toLowerCase() !== this.item.name.toLowerCase()))
				return;

			this.have++;
			if (this.have === this.need)
				this.ready();

			this.description = 'Loot ' + this.have + '/' + this.need + ' ' + this.item.name + ' from ' + this.mobName;
			this.obj.syncer.setArray(true, 'quests', 'updateQuests', this.simplify(true));
		},

		afterDestroyItem: function (item, quantity) {
			if (item.name.toLowerCase() !== this.item.name.toLowerCase())
				return;

			this.have -= quantity;
			if (this.have < 0)
				this.have = 0;

			this.description = 'Loot ' + this.have + '/' + this.need + ' ' + this.item.name + ' from ' + this.mobName;
			this.obj.syncer.setArray(true, 'quests', 'updateQuests', this.simplify(true));
		}
	}
};
