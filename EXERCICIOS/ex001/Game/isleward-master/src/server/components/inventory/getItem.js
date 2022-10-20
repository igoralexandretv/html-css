const events = require('../../misc/events');
const { isItemStackable } = require('./helpers');

const getNextId = items => {
	let id = 0;
	let iLen = items.length;

	for (let i = 0; i < iLen; i++) {
		let fItem = items[i];
		if (fItem.id >= id) 
			id = fItem.id + 1;
	}

	return id;
};

const dropBagForOverflow = (cpnInv, item) => {
	const { obj: { x, y, name, instance } } = cpnInv;

	const dropCell = instance.physics.getOpenCellInArea(x - 1, y - 1, x + 1, y + 1);
	if (dropCell) {
		cpnInv.createBag(dropCell.x, dropCell.y, [item], name);
		const msg = `Your inventory is too full to receive (${item.name}). It has been dropped on the ground.`;
		cpnInv.notifyNoBagSpace(msg);
	}
};

module.exports = (cpnInv, item, hideMessage, noStack, hideAlert, createBagIfFull = false) => {
	const obj = cpnInv.obj;
	obj.instance.eventEmitter.emit('onBeforeGetItem', item, obj);
	events.emit('beforePlayerGetItem', obj, item);

	//We need to know if a mob dropped it for quest purposes
	let fromMob = item.fromMob;

	if (!item.has('quality'))
		item.quality = 0;

	//Store the quantity to send to the player
	let quantity = item.quantity;

	let exists = false;
	if (isItemStackable(item) && !noStack) {
		let existItem = cpnInv.items.find(i => i.name === item.name);
		if (existItem) {
			exists = true;
			existItem.quantity = ~~(existItem.quantity || 1) + ~~(item.quantity || 1);
			item = existItem;
		}
	}

	if (!exists)
		delete item.pos;

	//Get next id
	if (!exists) {
		if (!cpnInv.hasSpace(item)) {
			if (createBagIfFull)
				dropBagForOverflow(cpnInv, item);
			else if (!hideMessage)
				cpnInv.notifyNoBagSpace();

			return false;
		}

		const items = cpnInv.items;
		item.id = getNextId(items);

		if (item.eq)
			delete item.pos;

		if (!item.has('pos') && !item.eq) {
			const iLen = items.length;
			let pos = iLen;
			for (let i = 0; i < iLen; i++) {
				if (!items.some(fi => fi.pos === i)) {
					pos = i;
					break;
				}
			}
			item.pos = pos;
		}
	}

	//Players can't have fromMob items in their inventory but bags can (dropped by a mob)
	if (obj.player)
		delete item.fromMob;

	if (obj.player) {
		let msg = item.name;
		if (quantity)
			msg += ' x' + quantity;
		else if ((item.stats) && (item.stats.weight))
			msg += ` ${item.stats.weight}lb`;
			
		const messages = [{
			class: 'q' + item.quality,
			message: 'loot: {' + msg + '}',
			item: item,
			type: 'loot'
		}];

		if (!hideAlert) {
			obj.instance.syncer.queue('onGetDamage', {
				id: obj.id,
				event: true,
				text: 'loot'
			}, -1);
		}

		if (!hideMessage) {
			obj.instance.syncer.queue('onGetMessages', {
				id: obj.id,
				messages: messages
			}, [obj.serverId]);
		}
	}

	if (item.effects) 
		cpnInv.hookItemEvents([item]);

	if (!exists)
		cpnInv.items.push(item);

	if (item.eq) {
		delete item.eq;

		if (item.ability)
			cpnInv.learnAbility({ itemId: item.id, slot: item.runeSlot });
		else
			obj.equipment.equip({ itemId: item.id });
	} else if (item.has('quickSlot')) {
		obj.equipment.setQuickSlot({
			itemId: item.id,
			slot: item.quickSlot
		});
	} else {
		obj.syncer.deleteFromArray(true, 'inventory', 'getItems', i => i.id === item.id);
		obj.syncer.setArray(true, 'inventory', 'getItems', cpnInv.simplifyItem(item), true);
	}

	if (!hideMessage && fromMob) 
		obj.fireEvent('afterLootMobItem', item);

	return item;
};
