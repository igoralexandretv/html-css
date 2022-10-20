module.exports = {
	type: 'holyVengeance',

	persist: true,

	events: {
		afterDealDamage: function (damage, target) {
			damage.dealt *= 0.5;
			this.obj.stats.getHp(damage, this.obj);
		}
	}
};
