let events = require('../../misc/events');

const recipesAlchemy = require('./alchemy');
const recipesCooking = require('./cooking');
const recipesEtching = require('./etching');
const recipesEnchanting = require('./enchanting');

let recipes = {
	alchemy: [ ...recipesAlchemy ],
	cooking: [ ...recipesCooking ],
	etching: [ ...recipesEtching ],
	enchanting: [ ...recipesEnchanting ]
};

module.exports = {
	init: function () {
		events.emit('onBeforeGetRecipes', recipes);
	},

	getList: function (type, unlocked) {
		const useRecipes = recipes[type];
		if (!useRecipes)
			return [];

		return useRecipes
			.filter(r => {
				let hasUnlocked = (r.default !== false);
				if (!hasUnlocked)
					hasUnlocked = unlocked.some(u => u.profession === type && u.teaches === r.id);

				return hasUnlocked;
			})
			.map(r => r.name);
	},

	getRecipe: function (type, name) {
		let recipe = (recipes[type] || []).find(r => r.name === name);
		return recipe;
	}
};
