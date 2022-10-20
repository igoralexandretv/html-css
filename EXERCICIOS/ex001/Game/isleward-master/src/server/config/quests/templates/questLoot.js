let slots = require('../../../items/config/slots');

module.exports = {
	slot: null,
	quality: 0,

	type: 'loot',

	build: function () {
		let slotNames = slots.slots
			.filter(s => (s !== 'tool'));

		if (this.slot) {
			if (this.slot instanceof Array) {
				if (this.slot.some(s => !slotNames.includes(s)))
					this.slot = null;
			} else {
				//Single slot quests are always regular quality
				this.quality = 0;
				
				if (!slotNames.some(s => (s === this.slot)))
					this.slot = null;
			}
		}

		if (!this.slot) {
			if (Math.random() < 0.2) {
				this.quality = 1 + ~~(Math.random() * 2);
				this.slotName = '';

				if (this.quality === 1) {
					let roll = ~~(Math.random() * 2);
					if (roll === 0)
						this.slotName = 'Magic Armor';
					else
						this.slotName = 'Magic Accessory';

					this.slot = ([
						[
							'head',
							'chest',
							'hands',
							'waist',
							'legs',
							'feet',
							'offHand'
						],
						[
							'trinket',
							'neck',
							'finger'
						]
					])[roll];
				} else {
					this.slotName = 'Rare Equipment';
					this.slot = slotNames;
				}

				this.name = 'Purveyor of Rarities';
				this.description = 'Loot 1x ' + this.slotName;
			} else {
				this.name = 'Purveyor of Artefacts';
				this.quality = 0;
				this.slot = slotNames[~~(Math.random() * slotNames.length)];
				this.slotName = this.slot[0].toUpperCase() + this.slot.substr(1);
				this.description = 'Loot 1x ' + this.slotName + ' slot item';
			}
		}

		return true;
	},

	getXpMultiplier: function () {
		let multiplier = 1;

		if (!this.quality)
			multiplier *= 8;
		else if (this.quality === 2)
			multiplier *= 6;
		else if (this.quality === 1)
			multiplier *= 4;

		return multiplier;
	},

	events: {
		afterLootMobItem: function (item) {
			if (
				(this.isReady) ||
				(this.obj.zoneName !== this.zoneName) ||
				(
					(this.quality) &&
					(item.quality < this.quality)
				) ||
				(
					(this.slot instanceof Array) &&
					(this.slot.indexOf(item.slot) === -1)
				) ||
				(
					(typeof(this.slot) === 'string') &&
					(this.slot !== item.slot)
				)
			)
				return;

			this.ready();
		}
	}
};
