module.exports = {
	type: 'syncer',

	locked: false,
	buffer: [],

	o: {
		components: []
	},
	oSelf: {
		components: []
	},

	reset: function () {
		this.o = {
			components: []
		};

		this.oSelf = {
			components: []
		};

		this.locked = false;

		this.buffer.forEach(q => {
			const [ method, ...rest ] = q;

			this[method].apply(this, rest);
		});

		this.buffer = [];
	},

	queue: function (args) {
		this.buffer.push(args);
	},

	get: function (self) {
		let o = this.o;
		if (self)
			o = this.oSelf;

		let keys = Object.keys(o);
		if (o.components.length === 0) {
			if (keys.length === 1)
				return null;
			delete o.components;
		}

		o.id = this.obj.id;

		return o;
	},

	set: function (self, cpnType, property, value) {
		if (this.locked) {
			this.queue(['set', self, cpnType, property, value]);

			return;
		}

		let o = this.o;
		if (self)
			o = this.oSelf;

		if (cpnType) {
			let cpn = o.components.find(c => (c.type === cpnType));

			if (!cpn) {
				cpn = {
					type: cpnType
				};
				o.components.push(cpn);
			}

			cpn[property] = value;
		} else 
			o[property] = value;
	},

	setComponent: function (self, cpnType, cpn) {
		if (this.locked) {
			this.queue(['setComponent', self, cpnType, cpn]);

			return;
		}

		let o = this.o;
		if (self)
			o = this.oSelf;

		let exists = o.components.find(c => c.type === cpnType);
		if (exists)
			extend(exists, cpn);
		else
			o.components.push(cpn);
	},

	setObject: function (self, cpnType, object, property, value) {
		if (this.locked) {
			this.queue(['setObject', self, cpnType, object, property, value]);

			return;
		}

		let o = this.o;
		if (self)
			o = this.oSelf;
		let cpn = o.components.find(c => (c.type === cpnType));

		if (!cpn) {
			cpn = {
				type: cpnType
			};
			o.components.push(cpn);
		}

		let obj = cpn[object];
		if (!obj) {
			obj = {};
			cpn[object] = obj;
		}

		obj[property] = value;
	},

	setArray: function (self, cpnType, property, value, noDuplicate) {
		if (this.locked) {
			this.queue(['setArray', self, cpnType, property, value, noDuplicate]);

			return;
		}

		let o = this.o;
		if (self)
			o = this.oSelf;
		let cpn = o.components.find(c => (c.type === cpnType));

		if (!cpn) {
			cpn = {
				type: cpnType
			};
			o.components.push(cpn);
		}

		if (!cpn[property])
			cpn[property] = [];

		if ((noDuplicate) && (cpn[property].find(f => (f === value))))
			return;

		cpn[property].push(value);
	},

	setSelfArray: function (self, property, value) {
		if (this.locked) {
			this.queue(['setSelfArray', self, property, value]);

			return;
		}

		let o = this.o;
		if (self)
			o = this.oSelf;

		if (!o.has(property))
			o[property] = [];

		o[property].push(value);
	},

	delete: function (self, cpnType, property) {
		let o = this.o;
		if (self)
			o = this.oSelf;

		if (cpnType) {
			let cpn = o.components.find(c => (c.type === cpnType));

			if (!cpn)
				return;

			delete cpn[property];
		} else 
			delete o[property];
	},

	deleteFromArray: function (self, cpnType, property, cbMatch) {
		let o = this.o;
		if (self)
			o = this.oSelf;
		let cpn = o.components.find(c => (c.type === cpnType));

		if (!cpn)
			return;
		else if (!cpn[property])
			return;

		cpn[property].spliceWhere(cbMatch);
	}
};
