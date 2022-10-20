module.exports = {
	callbacks: [],

	speed: 100,

	init: function () {
		setInterval(this.update.bind(this), this.speed);
	},

	register: function (sourceId, callback, time, destroyCallback) {
		let obj = {
			sourceId: sourceId,
			callback: callback,
			destroyCallback: destroyCallback,
			time: time
		};

		this.callbacks.push(obj);

		return obj;
	},
	unregister: function (sourceId) {
		let callbacks = this.callbacks;
		let cLen = callbacks.length;
		for (let i = 0; i < cLen; i++) {
			let c = callbacks[i];

			if (c.sourceId === sourceId) {
				if (c.destroyCallback)
					c.destroyCallback();
				callbacks.splice(i, 1);
				i--;
				cLen--;
			}
		}
	},

	update: function () {
		let speed = this.speed;

		let callbacks = this.callbacks;
		let cLen = callbacks.length;
		for (let i = 0; i < cLen; i++) {
			let c = callbacks[i];

			//If a spellCallback kills a mob he'll unregister his callbacks
			if (!c) {
				i--;
				cLen--;
				continue;
			}

			c.time -= speed;

			if (c.time <= 0) {
				if (c.callback)
					c.callback();
				if (c.destroyCallback)
					c.destroyCallback();
				callbacks.splice(i, 1);
				i--;
				cLen--;
			}
		}
	}
};
