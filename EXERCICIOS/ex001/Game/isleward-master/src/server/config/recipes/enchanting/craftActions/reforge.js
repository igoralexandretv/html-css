let generatorSpells = require('../../../../items/generators/spellbook');

module.exports = (obj, [item]) => {
	if (!item.spell)
		return;

	let spellName = item.spell.name.toLowerCase();
	let oldSpell = item.spell;
	delete item.spell;

	generatorSpells.generate(item, {
		spellName: spellName
	});
	item.spell = extend(oldSpell, item.spell);

	const damage = item.spell.values.damage;
	const msg = `Reforged weapon to damage: ${damage}`;

	return { msg };
};
