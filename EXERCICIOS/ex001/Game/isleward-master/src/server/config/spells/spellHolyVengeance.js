module.exports = {
	type: 'holyVengeance',

	cdMax: 0,
	manaCost: 0,

	duration: 10,

	targetFriendly: true,

	cast: function (action) {
		let target = action.target;
		if (!target.effects)
			target = this.obj;

		if (this.animation) {
			this.obj.instance.syncer.queue('onGetObject', {
				id: this.obj.id,
				components: [{
					type: 'animation',
					template: this.animation
				}]
			}, -1);
		}

		target.effects.addEffect({
			type: 'holyVengeance',
			ttl: this.duration
		});

		return true;
	}
};
