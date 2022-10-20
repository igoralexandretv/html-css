module.exports = {
	cbList: {},

	init: function () {
		for (let eventName in this.events) {
			let eventCb = this.events[eventName];

			this.cbList[eventName] = eventCb.bind(this);
			this.instance.eventEmitter.on(eventName, this.cbList[eventName]);
		}
	},

	destroy: function () {
		for (let e in this.cbList) 
			this.instance.eventEmitter.off(e, this.cbList[e]);
	}
};
