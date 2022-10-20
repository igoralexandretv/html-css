module.exports = {
	toString: function () {
		let res = {};

		for (let p in this) {
			if (['type', 'obj', 'physics', 'objects', 'syncer'].indexOf(p) > -1)
				continue;

			let val = this[p];
			let stringVal = (val && val.toString) ? val.toString() : val;
			const type = typeof(val);

			if (
				type !== 'function'
			) 
				res[p] = stringVal;
		}

		return res;
	}
};
