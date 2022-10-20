module.exports = {
	type: 'chainLightning',
	
	cdMax: 5,
	manaCost: 0,
	range: 9,
	needLos: true,

	damage: 1,

	cast: function (action) {
		let target = action.target;

		this.sendBump(target);

		this.obj.instance.syncer.queue('onGetObject', {
			id: this.obj.id,
			components: [{
				type: 'lightningEffect',
				toX: target.x,
				toY: target.y
			}]
		}, -1);

		this.queueCallback(this.explode.bind(this, target), 1);

		return true;
	},
	explode: function (target) {
		if ((this.obj.destroyed) || (target.destroyed))
			return;
		
		let damage = this.getDamage(target);
		target.stats.takeDamage(damage, this.threatMult, this.obj);
	}
};
