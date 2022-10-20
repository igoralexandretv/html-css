module.exports = {
	gotoPhaseIndex: null,
	repeats: 0,

	init: function () {
		if (!this.repeats) {
			this.end = true;
			return;
		}

		const event = this.event;

		const currentPhaseIndex = event.phases.findIndex(p => p === this);
		for (let i = this.gotoPhaseIndex; i < currentPhaseIndex; i++) {
			const phase = event.phases[i];

			delete phase.end;
			delete phase.destroyed;
		}

		event.nextPhase = this.gotoPhaseIndex;

		this.repeats--;

		this.end = true;
	}
};
