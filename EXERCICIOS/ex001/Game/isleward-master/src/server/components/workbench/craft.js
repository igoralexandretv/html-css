const recipes = require('../../config/recipes/recipes');
const generator = require('../../items/generator');

const { applyItemStats } = require('../equipment/helpers');

const buildRecipe = require('../workbench/buildRecipe');
const buildMaterials = require('../workbench/buildMaterials');
const buildPickedItems = require('../workbench/buildPickedItems');

module.exports = (cpnWorkbench, msg) => {
	const { craftType, obj: { instance: { objects: { objects } } } } = cpnWorkbench;
	const { name: recipeName, sourceId } = msg;

	const crafter = objects.find(o => o.serverId === sourceId);
	if (!crafter || !crafter.player)
		return null;

	const recipe = recipes.getRecipe(craftType, recipeName);
	if (!recipe)
		return null;

	const { needItems = [] } = recipe;
	const { syncer, inventory, equipment, spellbook } = crafter;

	const materials = buildMaterials(crafter, recipe, msg);
	const pickedItems = buildPickedItems(crafter, recipe, msg);
	
	const canCraft = (
		!materials.some(m => m.noHaveEnough) &&
			pickedItems.length === needItems.length &&
			!pickedItems.some(i => !i)
	);
	if (!canCraft)
		return null;

	materials.forEach(m => inventory.destroyItem({ itemId: m.id }, m.needQuantity));

	let resultMsg = null;

	if (recipe.craftAction) {
		pickedItems.forEach(p => {
			if (p.eq)
				applyItemStats(crafter, p, false);
		});

		const oldSlots = pickedItems.map(p => p.slot);
		resultMsg = recipe.craftAction(crafter, pickedItems);

		pickedItems.forEach((p, i) => {
			if (!p.eq) {
				pickedItems.forEach(item => syncer.setArray(true, 'inventory', 'getItems', inventory.simplifyItem(item)));
				
				return;
			}

			applyItemStats(crafter, p, true);

			if (p.slot !== oldSlots[i])
				equipment.unequip({ itemId: p.id });

			spellbook.calcDps();

			pickedItems.forEach(item => syncer.setArray(true, 'inventory', 'getItems', inventory.simplifyItem(item)));
		});

		equipment.unequipAttrRqrGear();
	}

	if (recipe.item || recipe.items) {
		const outputItems = recipe.item ? [ recipe.item ] : recipe.items;
		outputItems.forEach(itemBpt => {
			let item = null;
			if (itemBpt.generate)
				item = generator.generate(itemBpt);
			else
				item = extend({}, itemBpt);
				
			if (item.description)
				item.description += `<br /><br />(Crafted by ${crafter.name})`;
			else
				item.description = `<br /><br />(Crafted by ${crafter.name})`;
				
			const quantity = item.quantity;
			if (quantity && quantity.push)
				item.quantity = quantity[0] + ~~(Math.random() * (quantity[1] - quantity[0]));

			crafter.inventory.getItem(item);
		});
	}

	const result = {
		resultMsg,
		recipe: buildRecipe(craftType, crafter, msg)
	};

	return result;
};
