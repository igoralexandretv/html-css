//System
const eventEmitter = require('../misc/events');

//Helpers
const fixes = require('../fixes/fixes');
const cpnInventory = require('./inventory');
const { isItemStackable } = require('./inventory/helpers');

//Config
const maxItemsBase = 50;

//Component
module.exports = {
	type: 'stash',

	active: false,
	items: null,
	changed: false,

	maxItems: maxItemsBase,

	init: function (blueprint) {},

	getItemsFromDb: async function () {
		const { obj } = this;

		this.items = await io.getAsync({
			key: obj.account,
			table: 'stash',
			isArray: true,
			clean: true
		});

		fixes.fixStash(this.items);

		await eventEmitter.emit('onAfterGetStash', {
			obj: obj,
			stash: this.items
		});
	},

	getItem: function (item) {
		const { items } = this;

		if (isItemStackable(item)) {
			const existItem = items.find(i => i.name === item.name);
			if (existItem) {
				if (!existItem.quantity)
					existItem.quantity = 1;

				existItem.quantity += (+item.quantity || 1);

				//We modify the old object because it gets sent to the client
				item.id = existItem.id;
				item.quantity = existItem.quantity;

				item = existItem;

				return;
			}
		}

		//Get next id
		let id = 0;
		items.forEach(i => {
			if (i.id >= id)
				id = i.id + 1;
		});
		item.id = id;

		items.push(item);
	},

	deposit: async function (item) {
		if (!this.items)
			await this.getItemsFromDb();

		const { active, items, maxItems, obj } = this;

		if (!active)
			return;

		else if (items.length >= maxItems) {
			const isStackable = items.some(stashedItem => item.name === stashedItem.name && isItemStackable(stashedItem));
			if (!isStackable) {
				const message = 'You do not have room in your stash to deposit that item';
				obj.social.notifySelf({ message });

				return;
			}
		}

		this.changed = true;

		this.getItem(item);

		const sendItem = cpnInventory.simplifyItem.call({ obj: {} }, item);

		obj.instance.syncer.queue('onAddStashItems', [sendItem], [obj.serverId]);

		return true;
	},

	withdraw: function ({ itemId }) {
		const { active, items, obj } = this;

		if (!active)
			return;

		let item = items.find(i => i.id === itemId);
		if (!item)
			return;
		else if (!obj.inventory.hasSpace(item)) {
			const message = 'You do not have room in your inventory to withdraw that item';
			obj.social.notifySelf({ message });
			
			return;
		}

		this.changed = true;

		obj.inventory.getItem(item);
		items.spliceWhere(i => i === item);

		obj.instance.syncer.queue('onRemoveStashItems', [itemId], [obj.serverId]);
	},

	setActive: function (active) {
		const { obj } = this;

		this.active = active;

		const actionType = active ? 'addActions' : 'removeActions';
		obj.syncer.setArray(true, 'serverActions', actionType, {
			id: 'openStash',
			key: 'u',
			action: {
				cpn: 'stash',
				method: 'open',
				data: {
					targetId: obj.id
				}
			}
		});

		if (!this.active)
			return;

		let msg = 'Press U to access your Shared Stash';
		obj.instance.syncer.queue('onGetAnnouncement', {
			src: obj.id,
			msg: msg
		}, [obj.serverId]);
	},

	open: async function () {
		if (!this.items)
			await this.getItemsFromDb();

		const { obj, active, maxItems, items } = this;

		if (!active)
			return;

		const sendItems = items.map(i => cpnInventory.simplifyItem.call({ obj: {} }, i));

		const msg = {
			maxItems,
			items: sendItems
		};

		obj.instance.syncer.queue('onOpenStash', msg, [obj.serverId]);

		if (items.length > maxItems) {
			const message = `You have more than ${maxItems} items in your stash. In the future, these items will be lost.`;
			obj.social.notifySelf({ message });
		}
	},

	simplify: function (self) {
		if (!self)
			return null;

		return { type: 'stash' };
	},

	simplifyTransfer: function () {
		const { type, items } = this;

		return {
			type,
			items
		};
	},

	serialize: function () {
		return this.items.map(i => cpnInventory.simplifyItem.call({ obj: {} }, i));
	}
};
