module.exports = {
	init: function () {
		const { respawnMap, respawnPos } = this;

		instancer.startRegen(respawnMap, respawnPos);

		this.end = true;
	}
};
