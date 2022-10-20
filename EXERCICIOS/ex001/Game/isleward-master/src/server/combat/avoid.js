//Prebound Methods
const mathRandom = Math.random.bind(Math);

//Helpers
const willBlock = ({ isAttack, tgtValues: { blockAttackChance, blockSpellChance } }) => {
	const blockChance = isAttack ? blockAttackChance : blockSpellChance;
	const roll = mathRandom() * 100;

	const result = roll < blockChance;

	return result;
};

const willDodge = ({ isAttack, tgtValues: { dodgeAttackChance, dodgeSpellChance } }) => {
	const dodgeChance = isAttack ? dodgeAttackChance : dodgeSpellChance;
	const roll = mathRandom() * 100;

	const result = roll < dodgeChance;

	return result;
};

//Method
const avoid = (config, result) => {
	//Heals, among other things, should not be avoided
	if (config.noMitigate)
		return;

	result.blocked = willBlock(config);

	if (!result.blocked)
		result.dodged = willDodge(config);
};

//Exports
module.exports = avoid;
