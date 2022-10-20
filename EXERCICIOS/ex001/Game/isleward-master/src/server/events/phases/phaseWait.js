module.exports = {
	oldTtl: null,

	init: function () {
		if (!this.oldTtl)
			this.oldTtl = this.ttl;

		this.ttl = this.oldTtl;
	}
};
