module.exports = {
	id: null,

	init: function () {
		const { instance, id } = this;

		const mob = instance.objects.find(o => o.id === id);
		if (!mob) {
			this.end = true;

			return;
		}

		this.instance.syncer.queue('onGetObject', {
			x: mob.x,
			y: mob.y,
			components: [{
				type: 'attackAnimation',
				row: 0,
				col: 4
			}]
		}, -1);

		mob.destroyed = true;

		this.end = true;
	}
};
