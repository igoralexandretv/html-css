module.exports = {
	type: 'chatter',

	chats: null,
	cdMax: 50,
	cd: 0,
	chance: 0.035,

	global: false,

	init: function (blueprint) {
		this.chats = extend([], blueprint.chats);
		this.cd = ~~(Math.random() * this.cdMax);

		for (let p in blueprint) {
			if (p === 'chats')
				continue;

			this[p] = blueprint[p];
		}
	},

	update: function () {
		if ((this.obj.aggro) && (this.obj.aggro.list.length > 0))
			return;
		else if (this.chats.length === 0)
			return;

		if ((this.cd === 0) && (Math.random() < this.chance)) {
			this.cd = this.cdMax;

			let pick = this.chats[~~(Math.random() * this.chats.length)];

			if (!this.global)
				this.obj.syncer.set(false, 'chatter', 'msg', pick.msg);
			else {
				//HACK
				//This shouldn't always be pink, but only events use this atm so it's fine
				this.obj.instance.syncer.queue('onGetMessages', {
					messages: {
						class: 'color-pinkA',
						message: this.obj.name + ': ' + pick.msg
					}
				}, -1);
			}
		} else if (this.cd > 0)
			this.cd--;
	}
};
