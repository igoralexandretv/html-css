const { applyItemStats } = require('./equipment/helpers');

module.exports = {
	type: 'equipment',

	eq: {},

	quickSlots: {},

	init: function (blueprint) {

	},

	transfer: function () {
		if (this.eqTransfer) {
			this.eq = this.eqTransfer;
			delete this.eqTransfer;
		}
	},

	simplify: function (self) {
		return {
			type: 'equipment',
			eq: {},
			quickSlots: this.quickSlots,
			eqTransfer: this.eq
		};
	},

	isSlotEmpty: function (slot) {
		return !this.eq.has(slot);
	},

	equip: function (itemId) {
		let slot = null;
		if (typeof (itemId) === 'object') {
			slot = itemId.slot;
			itemId = itemId.itemId;
		}

		let obj = this.obj;
		let inventory = obj.inventory;

		let item = inventory.findItem(itemId);
		if (!item || item.eq)
			return;
		else if ((!item.slot) || (item.material) || (item.quest) || (item.ability) || (!inventory.canEquipItem(item))) {
			item.eq = false;
			return;
		}

		if (!slot)
			slot = item.equipSlot || item.slot;
		if (slot === 'twoHanded') {
			if (this.eq.has('offHand'))
				this.unequip({ itemId: this.eq.offHand }, true);

			slot = 'oneHanded';
		} else if (slot === 'offHand') {
			if (this.eq.has('oneHanded')) {
				let oneHandedEq = inventory.findItem(this.eq.oneHanded);
				if (oneHandedEq.slot === 'twoHanded')
					this.unequip({ itemId: this.eq.oneHanded }, true);
			}
		}

		let equipMsg = {
			success: true,
			item: item
		};
		obj.fireEvent('beforeEquipItem', equipMsg);
		if (!equipMsg.success) {
			const message = equipMsg.msg || 'you cannot equip that item';
			obj.social.notifySelf({ message });

			return;
		}

		delete item.pos;

		if (slot === 'finger') {
			let f1 = (this.eq.has('finger-1'));
			let f2 = (this.eq.has('finger-2'));

			if ((f1) && (f2))
				slot = 'finger-1';
			else if (!f1)
				slot = 'finger-1';
			else if (!f2)
				slot = 'finger-2';
		}

		if (this.eq.has(slot)) {
			if (this.eq[slot] === item.id)
				return;

			this.unequip({ itemId: this.eq[slot] }, true);
		}

		applyItemStats(obj, item, true);

		item.eq = true;
		this.eq[slot] = itemId;
		item.equipSlot = slot;

		if (obj.spellbook)
			obj.spellbook.calcDps();

		if ((!obj.mob) || (item.ability)) {
			if (item.spell)
				inventory.learnAbility({ itemId, slot: item.runeSlot, bypassEqCheck: true });
			else
				obj.syncer.setArray(true, 'inventory', 'getItems', inventory.simplifyItem(item));
		}

		obj.fireEvent('afterEquipItem', item);
	},

	unequip: function (itemId, ignoreSpaceCheck) {
		let item = itemId;
		if (typeof (itemId) === 'object')
			itemId = itemId.itemId;

		let obj = this.obj;
		let inventory = obj.inventory;

		if (typeof(item) !== 'object' || !item.has('id'))
			item = inventory.findItem(itemId);

		if (!item || !item.eq)
			return;
		else if (!ignoreSpaceCheck && !inventory.hasSpace()) {
			const message = 'You do not have room in your inventory to unequip that item';
			obj.social.notifySelf({ message });

			return;
		}

		delete item.eq;
		delete this.eq[item.equipSlot];
		delete item.equipSlot;

		applyItemStats(obj, item, false);

		inventory.setItemPosition(itemId);

		if (item.spell) {
			item.eq = true;
			inventory.unlearnAbility({ itemId });
		} else
			obj.syncer.setArray(true, 'inventory', 'getItems', inventory.simplifyItem(item));

		obj.spellbook.calcDps();

		obj.fireEvent('afterUnequipItem', item);

		this.unequipAttrRqrGear();
	},

	unequipAll: function () {
		let eq = this.eq;
		Object.keys(this.eq).forEach(function (slot) {
			this.unequip({ itemId: eq[slot] });
		}, this);
	},

	setQuickSlot: function (msg) {
		let obj = this.obj;
		const inventory = obj.inventory;

		if (!msg.has('itemId') && this.quickSlots.has(msg.slot)) { 
			let currentQuickItem = inventory.findItem(this.quickSlots[msg.slot]);
			if (!currentQuickItem)
				return;

			delete this.quickSlots[msg.slot];
			delete currentQuickItem.quickSlot;
			obj.syncer.setArray(true, 'inventory', 'getItems', currentQuickItem);

			return;
		}

		let item = inventory.findItem(msg.itemId);
		if (!item)
			return;

		let currentQuickId = this.quickSlots[msg.slot];
		if (currentQuickId) {
			let currentQuickItem = inventory.findItem(currentQuickId);
			if (currentQuickItem) {
				delete currentQuickItem.quickSlot;
				obj.syncer.setArray(true, 'inventory', 'getItems', currentQuickItem);
			}
		}

		this.quickSlots[msg.slot] = msg.itemId;

		item.quickSlot = msg.slot;
		obj.syncer.setArray(true, 'inventory', 'getItems', item);
	},

	useQuickSlot: function (msg) {
		if (!this.quickSlots.has(msg.slot))
			return;

		const inventory = this.obj.inventory;

		//If the item has been used up, find another one with the same name
		const item = inventory.findItem(this.quickSlots[0]);
		if (!item)
			return;

		inventory.useItem({ itemId: this.quickSlots[0] });

		if (item.uses <= 0 && !item.quantity)
			this.replaceQuickSlot(item);
	},

	replaceQuickSlot: function (item) {
		const newItem = this.obj.inventory.items.find(f => f.name === item.name);
		if (newItem) {
			newItem.quickSlot = 0;
			this.quickSlots[0] = newItem.id;
			this.obj.syncer.setArray(true, 'inventory', 'getItems', newItem);
		} else
			delete this.quickSlots[0];
	},

	unequipAttrRqrGear: function () {
		let inventory = this.obj.inventory;

		let eq = this.eq;
		Object.keys(this.eq).forEach(function (slot) {
			let itemId = eq[slot];
			let item = inventory.findItem(itemId);
			if (!item)
				return;

			let errors = inventory.equipItemErrors(item);
			if (errors.length > 0) {
				this.unequip({ itemId: itemId });

				let message = ({
					int: `You suddenly feel too stupid to wear your ${item.name}`,
					str: `Your weak body can no longer equip your ${item.name}`,
					dex: `Your sluggish physique cannot possibly equip your ${item.name}`,
					level: `Your level is too low to equip your ${item.name}`
				})[errors[0]];

				this.obj.social.notifySelf({
					message,
					type: 'rep'
				});
			}
		}, this);
	},

	unequipFactionGear: function (factionId, tier) {
		let inventory = this.obj.inventory;

		let eq = this.eq;
		Object.keys(this.eq).forEach(function (slot) {
			let itemId = eq[slot];
			let item = inventory.findItem(itemId);

			let factions = item.factions;
			if (!factions)
				return;

			let findFaction = factions.find(f => f.id === factionId);
			if (!findFaction)
				return;

			if (findFaction.tier > tier) {
				this.unequip({ itemId });

				const message = `You unequip your ${item.name} as it zaps you.`;
				this.obj.social.notifySelf({
					message,
					type: 'rep'
				});
			}
		}, this);
	},

	inspect: function (msg) {
		const targetPlayer = this.obj.instance.objects.find(o => o.id === msg.playerId);
		if (!targetPlayer || !targetPlayer.player)
			return;

		const targetEq = targetPlayer.inventory.items.filter(eq => eq.eq === true || eq.quickSlot === 0);
		const targetStats = targetPlayer.stats.values;
		
		const mappedEq = targetEq.map(m => targetPlayer.inventory.simplifyItem(m));
		const mappedStats = extend({}, targetStats);
		
		let result = {
			equipment: mappedEq,
			stats: mappedStats
		};

		this.obj.instance.syncer.queue('onInspectTarget', result, [this.obj.serverId]);
	}
};
