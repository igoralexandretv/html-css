module.exports = {
	events: {
		onGetText: function (selfItem) {
			let rolls = selfItem.effects.find(e => (e.type === 'reduceRuneManaReserve')).rolls;

			return `Reduces the mana reserved by ${rolls.rune} by ${rolls.amount}%`;
		},

		onBeforeReserveMana: function (selfItem, reserveEvent) {
			let rolls = selfItem.effects.find(e => (e.type === 'reduceRuneManaReserve')).rolls;

			if (rolls.rune.toLowerCase() !== reserveEvent.spell.toLowerCase())
				return;

			reserveEvent.reservePercent = Math.max(0, (reserveEvent.reservePercent * 100) - rolls.amount) / 100;
		},

		afterEquipItem: function (selfItem, eqItem) {
			let rolls = eqItem.effects?.find(e => (e.type === 'reduceRuneManaReserve'))?.rolls;
			if (!rolls)
				return;

			let spells = this.spellbook.spells.filter(s => s.active && s.name.toLowerCase() === rolls.rune);
			if (!spells.length)
				return;

			spells.forEach(spell => {
				let spellReserve = spell.manaReserve.percentage;

				this.stats.addStat('manaReservePercent', -Math.min(spellReserve, (rolls.amount / 100)));
			});
		},

		afterUnequipItem: function (selfItem, eqItem) {
			let rolls = eqItem.effects?.find(e => (e.type === 'reduceRuneManaReserve'))?.rolls;
			if (!rolls)
				return;

			let spells = this.spellbook.spells.filter(s => s.active && s.name.toLowerCase() === rolls.rune);
			if (!spells.length)
				return;

			spells.forEach(spell => {
				let spellReserve = spell.manaReserve.percentage;

				let stats = this.stats;
				let newReserve = stats.manaReservePercent + (Math.max(0, (spellReserve * 100) - rolls.amount) / 100) - spellReserve;

				stats.addStat('manaReservePercent', Math.min(spellReserve, (rolls.amount / 100)));
				if (newReserve < 0)
					this.spellbook.removeSpellById(spell.id);
			});
		}
	}
};
