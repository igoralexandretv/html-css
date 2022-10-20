module.exports = {
	type: 'reflectDamage',

	cdMax: 0,
	manaCost: 0,

	duration: 10,

	targetGround: true,

	cast: function (action) {
		let selfEffect = this.obj.effects.addEffect({
			type: 'reflectDamage',
			threatMult: this.threatMult
		});

		let ttl = this.duration * consts.tickTime;

		if (this.animation) {
			this.obj.instance.syncer.queue('onGetObject', {
				id: this.obj.id,
				components: [{
					type: 'animation',
					template: this.animation
				}]
			}, -1);
		}

		this.queueCallback(this.endEffect.bind(this, selfEffect), ttl - 50);

		return true;
	},
	endEffect: function (selfEffect) {
		if (this.obj.destroyed)
			return;

		let obj = this.obj;

		obj.effects.removeEffect(selfEffect.id);
	}
};
