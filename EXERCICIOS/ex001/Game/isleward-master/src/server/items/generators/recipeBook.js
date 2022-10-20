module.exports = {
	generate: function (item, { profession, teaches, sprite = [0, 5] }) {
		item.sprite = sprite;
		item.spritesheet = '../../../images/consumables.png';
		item.type = 'recipe';
		item.noSalvage = true;

		item.recipe = {
			profession,
			teaches
		};		
	}
};
