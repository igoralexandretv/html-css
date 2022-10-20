module.exports = {
	events: {
		onGetText: function (item) {
			const rolls = item.effects.find(e => (e.type === 'doubleProjectile')).rolls;

			return `${rolls.chance}% chance for ${rolls.spellName} to hit an additional target`;
		},

		beforeSpawnProjectile: function (item, spell, projectileConfig) {
			const rolls = item.effects.find(e => (e.type === 'doubleProjectile')).rolls;

			if (spell.name !== rolls.spellName)
				return;

			let chanceRoll = Math.random() * 100;
			if (chanceRoll >= rolls.chance)
				return;

			projectileConfig.extraTargets++;
		}
	}
};
