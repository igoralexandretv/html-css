module.exports = {
	type: 'frenzy',
	newCd: 0,

	events: {
		beforeSetSpellCooldown: function (msg, spell) {
			if (!spell.auto || !spell.isAttack)
				return;

			if (Math.random() * 100 >= this.chance)
				return;

			msg.cd = this.newCd;
		}
	}
};
