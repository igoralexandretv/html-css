module.exports = {
	id: null,
	mob: null,
	pos: {
		x: 0,
		y: 0
	},

	init: function () {
		const { instance, id, pos: { x, y } } = this;

		this.mob = instance.objects.find(o => o.id === id);
		this.mob.mob.originX = x;
		this.mob.mob.originY = y;
		this.mob.mob.goHome = true;
	},

	update: function () {
		const { pos: { x: targetX, y: targetY } } = this;
		const { mob: { x, y } } = this;

		const distance = Math.max(Math.abs(x - targetX), Math.abs(y - targetY));
		if (distance > 0)
			return;

		this.end = true;
	}
};
