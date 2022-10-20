module.exports = {
	config: null,
	state: -1,
	cd: 0,
	repeat: 0,

	init: function () {
		this.update();
	},

	update: function () {
		if (this.cd === 0) {
			if (this.state < this.config.length - 1) {
				this.state++;
				let stateConfig = this.config[this.state];

				if (stateConfig.repeat) {
					if (!stateConfig.oldRepeat)
						stateConfig.oldRepeat = stateConfig.repeat;

					stateConfig.repeat--;
				}

				this.cd = (stateConfig.delay instanceof Array) ? stateConfig.delay[stateConfig.oldRepeat - stateConfig.repeat - 1] : stateConfig.delay;
				this.events[stateConfig.type].call(this, stateConfig);

				if (stateConfig.repeat > 0)
					this.state--;
				else
					stateConfig.repeat = stateConfig.oldRepeat;

				//Sometimes (Like when we make a mob attackable, then check if they're alive in a new phase), the next phase doesn't 
				// trigger soon enough. So if there's no delay, make sure to switch phases asap.
				if (!this.cd)
					this.end = true;
			} else
				this.end = true;
		} else
			this.cd--;
	},

	events: {
		mobTalk: function (config) {
			let mob = this.instance.objects.objects.find(o => (o.id === config.id));
			let text = (config.text instanceof Array) ? config.text[config.oldRepeat - config.repeat - 1] : config.text;

			if (config.zone) {
				this.instance.syncer.queue('onGetMessages', {
					messages: {
						class: 'q4',
						message: mob.name + ': ' + text
					}
				}, -1);
			} else {
				mob.addComponent('chatter');
				mob.syncer.set(false, 'chatter', 'msg', text);
			}
		},

		addComponents: function (config) {
			let objects = this.instance.objects.objects;

			let components = config.components;
			if (!components.push)
				components = [components];
			let cLen = components.length;

			let mobs = config.mobs;
			if (!mobs.push)
				mobs = [mobs];
			let mLen = mobs.length;

			for (let i = 0; i < mLen; i++) {
				let mob = objects.find(o => o.id === mobs[i]);
				for (let j = 0; j < cLen; j++) {
					let c = components[j];
					const newComponent = mob.addComponent(c.type, components[j]);

					//Likely, nobody knows about this new component, so we need to sync it
					if (newComponent.simplify)
						mob.syncer.setComponent(false, c.type, newComponent.simplify());
				}
			}
		},

		removeComponents: function (config) {
			let objects = this.instance.objects.objects;

			let components = config.components;
			if (!components.push)
				components = [components];
			let cLen = components.length;

			let mobs = config.mobs;
			if (!mobs.push)
				mobs = [mobs];
			let mLen = mobs.length;

			for (let i = 0; i < mLen; i++) {
				let mob = objects.find(o => (o.id === mobs[i]));
				for (let j = 0; j < cLen; j++) 
					mob.removeComponent(components[j]);
			}
		}
	}
};
