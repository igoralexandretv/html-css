module.exports = {
	type: 'stealth',

	cdMax: 0,
	manaCost: 0,

	duration: 10,

	targetGround: true,

	effect: null,

	cast: function (action) {
		//Clear Aggro
		this.obj.aggro.die();

		let ttl = this.duration * consts.tickTime;
		let endCallback = this.queueCallback(this.endEffect.bind(this), ttl - 50);

		this.effect = this.obj.effects.addEffect({
			type: 'stealth',
			endCallback: endCallback
		});

		return true;
	},
	endEffect: function () {
		if (this.obj.destroyed)
			return;

		let obj = this.obj;

		obj.effects.removeEffect(this.effect.id);
		this.obj.aggro.move();
	}
};
