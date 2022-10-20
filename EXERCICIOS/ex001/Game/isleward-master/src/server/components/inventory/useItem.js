const learnRecipe = require('./learnRecipe');

const isOnCooldown = (obj, cpnInv, { item, cd }) => {
	if (item.cdMax) {
		if (cd) {
			process.send({
				method: 'events',
				data: {
					onGetAnnouncement: [{
						obj: {
							msg: 'That item is on cooldown'
						},
						to: [obj.serverId]
					}]
				}
			});

			return true;
		}

		return false;
	}

	return false;
};

const placeItemOnCooldown = (obj, cpnInv, item, { cdMax }) => {
	item.cd = cdMax;

	//Find similar items and put them on cooldown too
	cpnInv.items.forEach(function (i) {
		if (i.name === item.name && i.cdMax === item.cdMax)
			i.cd = cdMax;
	});
};

module.exports = async (cpnInv, itemId) => {
	let item = cpnInv.findItem(itemId);
	if (!item)
		return;

	let obj = cpnInv.obj;

	const beforeGetCooldownMessage = {
		obj,
		item,
		cd: item.cd
	};
	obj.instance.eventEmitter.emit('onBeforeGetItemCd', beforeGetCooldownMessage);
	obj.fireEvent('onBeforeGetItemCd', beforeGetCooldownMessage);

	if (isOnCooldown(obj, cpnInv, beforeGetCooldownMessage))
		return;

	let result = {
		success: true,
		cdMax: item.cdMax
	};
	//Deprecated
	obj.instance.eventEmitter.emit('onBeforeUseItem', obj, item, result);
	obj.fireEvent('onBeforeUseItem', item, result);
	//New
	const eventMsg = {
		obj,
		item,
		cdMax: item.cdMax,
		success: true
	};
	obj.instance.eventEmitter.emit('beforeUseItem', eventMsg);

	if (!result.success || !eventMsg.success)
		return;

	placeItemOnCooldown(obj, cpnInv, item, result);

	if (item.recipe) {
		const didLearn = await learnRecipe(obj, item);
		if (didLearn)
			cpnInv.destroyItem({ itemId }, 1);

		return;
	}

	let effects = (item.effects || []);
	let eLen = effects.length;
	for (let j = 0; j < eLen; j++) {
		let effect = effects[j];
		if (!effect.events)
			continue;

		let effectEvent = effect.events.onConsumeItem;
		if (!effectEvent)
			continue;

		let effectResult = {
			success: true,
			errorMessage: null
		};

		effectEvent.call(obj, effectResult, item, effect);

		if (!effectResult.success) {
			obj.social.notifySelf({ message: effectResult.errorMessage });

			return;
		}
	}

	if (item.type === 'consumable') {
		if (item.uses) {
			item.uses--;

			if (item.uses) {
				obj.syncer.setArray(true, 'inventory', 'getItems', item);
				return;
			}
		}

		cpnInv.destroyItem({ itemId }, 1);
		if (item.has('quickSlot'))
			cpnInv.obj.equipment.replaceQuickSlot(item);
	}
};
