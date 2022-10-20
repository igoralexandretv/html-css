//Prebound Methods
const mathRandom = Math.random.bind(Math);
const max = Math.max.bind(Math);

//Helpers
const scaleStatType = (config, result) => {
	const { statType, statMult = 1, srcValues } = config;

	if (!statType)
		return;
	
	let statValue = 0;

	if (!statType.push)
		statValue = srcValues[statType];
	else {
		statType.forEach(s => {
			statValue += srcValues[s];
		});
	}

	statValue = max(1, statValue);

	result.amount *= statValue * statMult;
};

const scalePercentMultipliers = ({ isAttack, elementName, srcValues }, result) => {
	const { dmgPercent = 0, physicalPercent = 0, spellPercent = 0 } = srcValues;

	let totalPercent = 100 + dmgPercent;	

	if (isAttack)
		totalPercent += physicalPercent;
	else
		totalPercent += spellPercent;

	if (elementName)
		totalPercent += (srcValues[elementName + 'Percent'] || 0);

	result.amount *= (totalPercent / 100);
};

const scaleCrit = ({ noCrit, isAttack, crit: forceCrit, srcValues }, result) => {
	if (noCrit)
		return;

	const { critChance, attackCritChance, spellCritChance } = srcValues;
	const { critMultiplier, attackCritMultiplier, spellCritMultiplier } = srcValues;

	let totalCritChance = critChance;
	let totalCritMultiplier = critMultiplier;

	if (isAttack) {
		totalCritChance += attackCritChance;
		totalCritMultiplier += attackCritMultiplier;
	} else {
		totalCritChance += spellCritChance;
		totalCritMultiplier += spellCritMultiplier;
	}

	const didCrit = forceCrit || mathRandom() * 100 < totalCritChance;

	if (didCrit) {
		result.crit = true;
		result.amount *= (totalCritMultiplier / 100);
	}
};

//Method
const scale = (config, result) => {
	const { blocked, dodged } = result; 

	if (blocked || dodged || config.noScale)
		return;

	scaleStatType(config, result);
	scalePercentMultipliers(config, result);
	scaleCrit(config, result);
};

//Exports
module.exports = scale;
