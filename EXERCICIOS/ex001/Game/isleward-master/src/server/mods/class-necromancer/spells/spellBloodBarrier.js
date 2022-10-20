module.exports = {
	type: 'bloodBarrier',

	cdMax: 7,
	manaCost: 0,

	range: 9,

	speed: 150,
	damage: 1,

	row: 3,
	col: 0,

	needLos: true,
	autoTargetFollower: true,
	targetFriendly: true,
	noTargetSelf: true,

	cast: function (action) {
		const { target } = action;

		this.sendBump(target);

		this.queueCallback(this.explode.bind(this, action), 1, null, target);

		return true;
	},

	explode: function (action) {
		const { obj } = this;
		const { target } = action;

		if ((obj.destroyed) || (target.destroyed))
			return;

		let amount = (obj.stats.values.hpMax / 100) * this.drainPercentage;
		const damage = { amount };
		obj.stats.takeDamage(damage, 0, obj);

		amount = amount * this.shieldMultiplier;
		const heal = { amount };
		target.stats.getHp(heal, obj);

		//Only reset the first spell's cooldown if it's an auto attack and not a spell
		const firstSpell = target.spellbook.spells[0];
		const resetFirstSpell = (
			firstSpell &&
			firstSpell.isAttack &&
			firstSpell.auto
		);

		if (resetFirstSpell)
			target.spellbook.spells[0].cd = 0;

		target.effects.addEffect({
			type: 'frenzy',
			ttl: this.frenzyDuration,
			newCd: target.player ? 2 : 0
		});
	}
};
