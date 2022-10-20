const baseRecipes = {
	carp: {
		description: 'It\'s a fish on a stick, what more do you want to know?',
		item: {
			name: 'Carp on a Stick',
			type: 'consumable',
			sprite: [0, 9],
			description: 'It\'s a fish on a stick, what more do you want to know?',
			worth: 0,
			noSalvage: true,
			noAugment: true,
			uses: 1,
			effects: [{
				type: 'gainStat',
				rolls: {
					stat: 'hp'
				}
			}]
		},
		materials: [{
			quantity: 1
		}, {
			name: 'Skewering Stick',
			quantity: 1
		}]
	}
};

const buildRecipe = function (recipeName, itemName, effectAmount, materialName, quantity) {
	return extend({}, baseRecipes[recipeName], {
		name: itemName,
		item: {
			name: itemName,
			quantity: quantity,
			effects: [{
				rolls: {
					amount: effectAmount
				}
			}]
		},
		materials: [{
			name: materialName
		}]
	});
};

module.exports = [
	buildRecipe('carp', 'Carp on a Stick', 50, 'Sun Carp', 1),
	buildRecipe('carp', 'Big Carp on a Stick', 50, 'Big Sun Carp', 2),
	buildRecipe('carp', 'Giant Carp on a Stick', 150, 'Giant Sun Carp', 1),
	buildRecipe('carp', 'Trophy Carp on a Stick', 150, 'Trophy Sun Carp', 2),
	buildRecipe('carp', 'Fabled Carp on a Stick', 200, 'Fabled Sun Carp', [3, 5])
];
