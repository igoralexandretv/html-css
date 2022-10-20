module.exports = {
	init: function () {
		let mob = this.instance.objects.objects.find(m => (m.id === this.mobId));
		let states = mob.dialogue.states;

		this.addStates(states, this.dialogue.add || {});
		this.removeStates(states, this.dialogue.remove || {});
	},

	addStates: function (dialogue, states) {
		for (let s in states) {
			let source = extend({}, states[s]);
			let target = dialogue[s];
			if (!target) {
				dialogue[s] = source;
				continue;
			}

			for (let o in source) {
				target.msg[0].options.push(o);
				target.options[o] = source[o];
			}
		}
	},

	removeStates: function (dialogue, states) {
		for (let s in states) {
			let source = states[s];
			let target = dialogue[s];

			if (!target)
				continue;
			else if (!source) {
				delete dialogue[s];
				continue;
			}

			for (let o in source) {
				let targetOptions = target.msg[0].options;
				if (targetOptions.options)
					targetOptions.spliceWhere(t => (t === o));

				delete target.options[o];
			}
		}
	}
};
