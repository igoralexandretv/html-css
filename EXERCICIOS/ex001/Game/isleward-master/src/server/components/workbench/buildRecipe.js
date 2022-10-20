const recipes = require('../../config/recipes/recipes');

const buildMaterials = require('./buildMaterials');
const buildNeedItems = require('./buildNeedItems');

const buildBase = (crafter, { name, description }) => {
	return {
		name,
		description
	};
};

module.exports = (craftType, crafter, msg) => {
	const recipe = recipes.getRecipe(craftType, msg.name);
	if (!recipe)
		return;

	const result = buildBase(crafter, recipe);

	const needItems = buildNeedItems(crafter, recipe);
	if (needItems)
		result.needItems = needItems;

	if (recipe.materialGenerator || recipe.needItems)
		result.dynamicMaterials = true;

	result.materials = buildMaterials(crafter, recipe, msg);

	return result;
};
