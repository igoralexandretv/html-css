module.exports = {
	update: function () {
		const anyMobsAlive = this.event.objects.some(o => {
			if (!o.mob)
				return false;
			else if (!o.destroyed)
				return true;

			return false;
		});

		if (!anyMobsAlive)
			this.end = true;
	}
};
