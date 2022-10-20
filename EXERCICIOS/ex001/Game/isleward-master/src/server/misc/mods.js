const fileLister = require('../misc/fileLister');
const events = require('../misc/events');

module.exports = {
	mods: [],

	init: async function () {
		const modList = fileLister.getFolderList('mods');

		//Load all mods
		let loadList = modList.map(m => {
			const path = `../mods/${m}/index`;

			const mod = require(path);
			const id = mod.id ? mod.id : m.replace('iwd-', '');

			return {
				id,
				folderName: m,
				path,
				mod
			};
		});

		while (loadList.length) {
			for (const m of loadList) {
				const { id, folderName, mod } = m;
				const { dependsOn = [] } = mod;

				const wait = dependsOn.some(d => loadList.some(l => l.id === d));

				if (wait)
					continue;

				await this.onGetMod(folderName, mod);

				this.mods.push(mod);

				loadList.spliceWhere(l => l.id === id);
			}
		}
	},

	onGetMod: async function (name, mod) {
		if (mod.disabled)
			return;

		const isMapThread = !!global.instancer;
		mod.isMapThread = isMapThread;

		mod.events = events;
		mod.folderName = 'server/mods/' + name;
		mod.relativeFolderName = 'mods/' + name;

		let list = (mod.extraScripts || []);
		let lLen = list.length;

		for (let i = 0; i < lLen; i++) {
			let extra = require('../mods/' + name + '/' + list[i]);
			this.onGetExtra(name, mod, extra);
		}

		if (typeof mod.init === 'function')
			await mod.init();

		if (isMapThread && typeof mod.initMapThread === 'function')
			await mod.initMapThread();
		else if (!isMapThread && typeof mod.initMainThread === 'function')
			await mod.initMainThread();
	},

	onGetExtra: function (name, mod, extra) {
		extra.folderName = 'server/mods/' + name;
	},

	tick: function () {
		this.mods.forEach(m => {
			if (m.tick)
				m.tick();
		});
	}
};
