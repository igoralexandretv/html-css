module.exports = {
	desc: null,

	init: function (event) {
		event.eventManager.setEventDescription(event.config.name, this.desc);
	}
};
