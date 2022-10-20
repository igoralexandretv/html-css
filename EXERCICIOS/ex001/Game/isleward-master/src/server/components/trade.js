let generator = require('../items/generator');
let statGenerator = require('../items/generators/stats');
let skins = require('../config/skins');

const sendMessage = ({ instance, id, serverId }, color, message) => {
	instance.syncer.queue('onGetMessages', {
		id: id,
		messages: [{
			class: color,
			message,
			type: 'info'
		}]
	}, [serverId]);
};

module.exports = {
	type: 'trade',

	items: [],
	buybackList: {},

	maxBuyback: 10,

	blueprint: null,
	gold: 0,

	target: null,

	regenCd: 0,
	regenCdMax: 1710,
	genLeft: 0,

	markup: {
		buy: 1,
		sell: 1
	},

	init: function (blueprint) {
		this.blueprint = blueprint;
		this.gold = blueprint.gold;		
		this.items = [];
		this.regenCd = this.regenCdMax;

		(blueprint.forceItems || []).forEach(function (f, i) {
			let item = extend({}, f);

			let id = 0;
			this.items.forEach(function (checkItem) {
				if (checkItem.id >= id)
					id = checkItem.id + 1;
			});

			if (item.type === 'skin') {
				let skinBlueprint = skins.getBlueprint(item.skinId);
				item.name = skinBlueprint.name;
				item.sprite = skinBlueprint.sprite;
				item.spritesheet = skinBlueprint.spritesheet;
				item.skinId = item.skinId;
			}

			item.id = id;

			this.items.push(item);
		}, this);

		if (!blueprint.items)
			return;

		this.markup = blueprint.markup;

		if (blueprint.faction) {
			this.obj.extendComponent('trade', 'factionVendor', blueprint);
			return;
		}

		this.genLeft = blueprint.items.max;
	},

	update: function () {
		if (this.regenCd > 0) {
			this.regenCd--;
			return;
		}

		this.regenCd = this.regenCdMax;

		if (!this.genLeft)
			return;

		this.genLeft--;

		let blueprint = this.blueprint;
		let level = 1;
		if (blueprint.level)
			level = blueprint.level.min + ~~(Math.random() * (blueprint.level.max - blueprint.level.min));

		let item = generator.generate({
			noSpell: true,
			level: level
		});

		let id = 0;
		this.items.forEach(function (checkItem) {
			if (checkItem.id >= id)
				id = checkItem.id + 1;
		});

		item.id = id;

		this.items.push(item);
	},

	startBuy: function (msg) {
		if (!msg.has('target') && !msg.targetName)
			return false;

		let target = msg.target;

		if (target && !target.id)
			target = this.obj.instance.objects.objects.find(o => o.id === target);
		else if (msg.targetName)
			target = this.obj.instance.objects.objects.find(o => ((o.name) && (o.name.toLowerCase() === msg.targetName.toLowerCase())));

		this.target = null;

		if ((!target) || (!target.trade))
			return false;

		this.target = target;

		let itemList = target.trade.getItems(this.obj);
		let markup = target.trade.markup.sell;

		if (msg.action === 'buyback') {
			itemList = target.trade.buybackList[this.obj.name] || [];
			markup = target.trade.markup.buy;
		}

		this.obj.syncer.set(true, 'trade', 'buyList', {
			markup: markup,
			items: itemList,
			buyback: (msg.action === 'buyback')
		});
	},

	buySell: function (msg) {
		if (msg.action === 'buy')
			this.buy(msg);
		else if (msg.action === 'sell')
			this.sell(msg);
		else if (msg.action === 'buyback')
			this.buyback(msg);
	},

	buy: async function (msg) {
		let target = this.target;
		if (!target)
			return;

		let item = null;
		let targetTrade = target.trade;
		let markup = targetTrade.markup.sell;

		if (msg.action === 'buyback') {
			item = targetTrade.findBuyback(msg.itemId, this.obj.name);
			markup = targetTrade.markup.buy;
		} else
			item = targetTrade.findItem(msg.itemId, this.obj.name);

		if (!item) {
			this.resolveCallback(msg);
			return;
		}

		let canAfford = false;
		if (item.worth.currency) {
			let currencyItem = this.obj.inventory.items.find(i => (i.name === item.worth.currency));
			canAfford = ((currencyItem) && (currencyItem.quantity >= item.worth.amount));
		} else
			canAfford = this.gold >= ~~(item.worth * markup);

		if (!canAfford) {
			sendMessage(this.obj, 'color-redA', 'You can\'t afford that item.');
			this.resolveCallback(msg);
			return;
		}

		if (!targetTrade.canBuy(msg.itemId, this.obj, msg.action)) {
			this.resolveCallback(msg);
			return;
		}

		if (item.type === 'skin') {
			let haveSkin = await this.obj.auth.doesOwnSkin(item.skinId);

			if (haveSkin) {
				sendMessage(this.obj, 'color-redA', 'You have already unlocked that skin.');
				this.resolveCallback(msg);
				return;
			}
		}

		if (msg.action === 'buyback')
			targetTrade.removeBuyback(msg.itemId, this.obj.name);
		else if ((item.type !== 'skin') && (!item.infinite)) {
			targetTrade.removeItem(msg.itemId, this.obj.name);
			targetTrade.genLeft++;
		}

		if (item.type !== 'skin') {
			//Some shop items have both an in-shop definition (item) as well as a definition
			// for the item that should be given to the player (giveItem)
			let clonedItem = extend({}, item.giveItem || item);

			if (item.worth.currency)
				clonedItem.worth = 0;
			if ((item.stats) && (item.stats.stats)) {
				delete clonedItem.stats;
				statGenerator.generate(clonedItem, {});
			}

			delete clonedItem.infinite;

			if (clonedItem.generate) {
				clonedItem = generator.generate(clonedItem);
				delete clonedItem.generate;

				if (item.factions)
					clonedItem.factions = item.factions;
			}

			if (!this.obj.inventory.getItem(clonedItem)) {
				this.resolveCallback(msg);
				return;
			}

			if (!item.infinite)
				this.obj.syncer.setArray(true, 'trade', 'removeItems', item.id);
		}

		if (item.worth.currency) {
			let currencyItem = this.obj.inventory.items.find(i => (i.name === item.worth.currency));
			this.obj.inventory.destroyItem({ itemId: currencyItem.id }, item.worth.amount, true);
		} else {
			targetTrade.gold += ~~(item.worth * markup);
			this.gold -= ~~(item.worth * markup);
			this.obj.syncer.set(true, 'trade', 'gold', this.gold);
		}

		//Hack to always redraw the UI (to give items the red overlay if they can't be afforded)
		this.obj.syncer.setArray(true, 'trade', 'redraw', true);

		this.resolveCallback(msg);
	},

	buyback: function (msg) {
		msg.action = 'buyback';
		this.buy(msg);
	},

	sell: function (msg) {
		let target = this.target;
		if (!target)
			return;

		let targetTrade = target.trade;

		const item = this.obj.inventory.findItem(msg.itemId);
		if (!item)
			return;

		const oldQuantity = item.quantity;
		this.obj.inventory.destroyItem({ itemId: msg.itemId });

		if (oldQuantity)
			item.quantity = oldQuantity;

		let worth = ~~((item.quantity ?? 1) * item.worth * targetTrade.markup.buy);

		this.gold += worth;

		this.obj.syncer.set(true, 'trade', 'gold', this.gold);
		this.obj.syncer.setArray(true, 'trade', 'removeItems', item.id);

		let buybackList = targetTrade.buybackList;
		let name = this.obj.name;
		if (!buybackList[name])
			buybackList[name] = [];

		buybackList[name].push(item);
		if (buybackList[name].length > this.maxBuyback)
			buybackList[name].splice(0, 1);
	},

	startSell: function (msg) {
		let target = msg.target;
		let targetName = (msg.targetName || '').toLowerCase();

		if (!target && !targetName)
			return false;

		if (target && !target.id)
			target = this.obj.instance.objects.objects.find(o => o.id === target);
		else if (targetName)
			target = this.obj.instance.objects.objects.find(o => ((o.name) && (o.name.toLowerCase() === targetName)));

		this.target = null;

		if ((!target) || (!target.trade))
			return false;

		this.target = target;

		let itemList = this.obj.inventory.items
			.filter(i => ((i.worth > 0) && (!i.eq)));
		itemList = extend([], itemList);

		this.obj.syncer.set(true, 'trade', 'sellList', {
			markup: target.trade.markup.buy,
			items: itemList.map(i => this.obj.inventory.simplifyItem(i))
		});
	},

	startBuyback: function (msg) {
		msg.action = 'buyback';
		this.startBuy(msg);
	},

	removeItem: function (itemId) {
		return this.items.spliceFirstWhere(i => i.id === itemId);
	},

	removeBuyback: function (itemId, name) {
		return (this.buybackList[name] || []).spliceFirstWhere(i => i.id === itemId);
	},

	getItems: function (requestedBy) {
		let items = this.items.map(i => requestedBy.inventory.simplifyItem(i));

		return items;
	},

	canBuy: function (itemId, requestedBy, action) {
		let item = null;
		if (action === 'buy')
			item = this.findItem(itemId, requestedBy.name);
		else if (action === 'buyback')
			item = this.findBuyback(itemId, requestedBy.name);

		let result = true;
		if (item.factions)
			result = requestedBy.reputation.canEquipItem(item);

		if (!result) {
			const message = 'your reputation is too low to buy that item';
			requestedBy.social.notifySelf({ message });
		}

		return result;
	},

	findItem: function (itemId, sourceName) {
		return this.items.find(i => i.id === itemId);
	},

	findBuyback: function (itemId, sourceName) {
		return (this.buybackList[sourceName] || []).find(i => i.id === itemId);
	},

	resolveCallback: function (msg, result) {
		let callbackId = msg.has('callbackId') ? msg.callbackId : msg;
		result = result || [];

		if (!callbackId)
			return;

		process.send({
			module: 'atlas',
			method: 'resolveCallback',
			msg: {
				id: callbackId,
				result: result
			}
		});
	},

	simplify: function (self) {
		let result = {
			type: 'trade'
		};

		if (self)
			result.gold = this.gold;

		return result;
	},

	events: {
		beforeMove: function () {
			if (!this.target)
				return;

			this.obj.syncer.set(true, 'trade', 'closeTrade', true);

			this.target = null;
		}
	}
};
