module.exports = {
	type: 'particles',

	blueprint: null,

	simplify: function (self) {
		const { blueprint } = this;

		const result = {
			type: 'particles',
			blueprint
		};

		return result;
	}
};
