const getDefaultRotationSpell = rotationSpells => {
	const spells = rotationSpells.filter(s => !s.atRotationTicks);

	if (!spells.length)
		return;

	if (spells.length === 1)
		return spells[0];

	const randomSpell = spells[~~(Math.random() * spells.length)];

	return randomSpell;
};

//Mobs that define rotations (normally bosses) use this method to determine their spell choices
const getRotationSpell = (source, target) => {
	const { spells, rotation: { currentTick, spells: rotationSpells } } = source;

	//Find spell matching current tick
	let rotationEntry = rotationSpells.find(s => s.atRotationTicks?.includes(currentTick));

	if (!rotationEntry)
		rotationEntry = getDefaultRotationSpell(rotationSpells);

	if (!rotationEntry)
		return;

	//Don't cast anything
	if (rotationEntry.spellIndex === -1)
		return;

	const useSpell = spells[rotationEntry.spellIndex];

	//Todo: We should set cdMax and manaCost to 0 of rotation spells (unless there's a mana drain mechanic)
	// later and we want to allow that on bosses
	useSpell.cd = 0;
	useSpell.manaCost = 0;
	if (!useSpell.selfCast && !useSpell.canCast(target))
		return getDefaultRotationSpell(rotationSpells);

	return useSpell;
};

//Mobs without rune rotations (normally the case) simple select any random spell that is valid
const getRandomSpell = (source, target) => {
	const valid = source.spells.filter(s => {
		return (!s.selfCast && !s.procCast && !s.castOnDeath && s.canCast(target));
	});

	if (!valid.length)
		return null;

	return valid[~~(Math.random() * valid.length)];
};

const getSpellToCast = (source, target) => {
	if (source.rotation)
		return getRotationSpell(source, target);

	const { obj: { follower } } = source;

	//Mobs don't cast all the time but player followers do
	if (!follower?.master?.player && Math.random() >= 0.65)
		return;

	return getRandomSpell(source, target);
};

const tick = source => {
	if (!source.obj.aggro.isInCombat())
		return;

	const { rotation } = source;

	rotation.currentTick++;

	if (rotation.currentTick === rotation.duration)
		rotation.currentTick = 1;
};

//Gets the range we need to be at to cast a specific rotation spell
const getFurthestRangeRotation = (source, target, checkCanCast) => {
	const spell = getRotationSpell(source, target);

	if (!spell)
		return 0;

	return spell.range;
};

/*
	This is used by mobs when in combat mode,
	* When checkCanCast is true, we want to see if we can cast right now
	* When checkCanCast is false, we want to see if there is a spell we could cast in the near future
	  -> This could be a spell that is currently on cooldown, or that the mob has insufficient mana for
	  ---> Even though mobs don't need mana for spells at the moment
	  -> Ultimately, this means the mob should not move, just wait
*/
const getFurthestRange = (source, target, checkCanCast) => {
	const { spells, rotation } = source;

	if (rotation)
		return getFurthestRangeRotation(source, target, checkCanCast);

	let sLen = spells.length;
	let furthest = 0;
	for (let i = 0; i < sLen; i++) {
		let spell = spells[i];
		if (spell.procCast || spell.castOnDeath)
			continue;

		if (spell.range > furthest && (!checkCanCast || spell.canCast()))
			furthest = spell.range;
	}

	return furthest;
};

const resetRotation = source => {
	if (!source.rotation)
		return;

	source.rotation.currentTick = 0;
};

module.exports = {
	tick,
	resetRotation,
	getSpellToCast,
	getFurthestRange
};
