module.exports = {
	init: function () {
		const event = this.event;

		event.nextPhase = event.phases.length;

		this.end = true;
	}
};
