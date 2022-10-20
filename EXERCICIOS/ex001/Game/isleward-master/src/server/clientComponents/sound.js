define([
	'js/sound/sound'
], function (
	soundManager
) {
	return {
		type: 'sound',

		sound: null,
		volume: 0,

		soundEntry: null,

		init: function () {
			const { 
				sound, volume, music, defaultMusic, loop = true,
				obj: { zoneId, x, y, width, height, area }
			} = this;

			const config = {
				scope: zoneId,
				file: sound,
				volume, 
				x, 
				y, 
				w: width, 
				h: height, 
				area,
				music,
				defaultMusic,
				loop
			};

			this.soundEntry = soundManager.addSound(config);
		},

		extend: function (bpt) {
			Object.assign(this, bpt);

			Object.assign(this.soundEntry, bpt);
		},

		destroy: function () {
			if (this.soundEntry?.sound)
				this.soundEntry?.sound.stop();

			soundManager.destroySoundEntry(this.soundEntry);
		}
	};
});
