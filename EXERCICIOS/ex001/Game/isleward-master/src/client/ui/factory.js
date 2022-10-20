define([
	'ui/uiBase',
	'js/system/events',
	'js/system/client',
	'js/system/globals',
	'js/misc/tosAcceptanceValid'
], function (
	uiBase,
	events,
	client,
	globals,
	tosAcceptanceValid
) {
	return {
		uis: [],
		root: '',
		ingameUisBuilt: false,

		init: function (root) {
			if (root)
				this.root = root + '/';

			events.on('onBuildIngameUis', this.onBuildIngameUis.bind(this));
			events.on('onUiKeyDown', this.onUiKeyDown.bind(this));
			events.on('onResize', this.onResize.bind(this));

			globals.clientConfig.uiLoginList.forEach(u => {
				if (u.path)
					this.buildModUi(u);
				else
					this.build(u);
			});
		},

		onBuildIngameUis: async function () {
			if (!this.ingameUisBuilt) {
				events.clearQueue();

				await Promise.all(
					globals.clientConfig.uiList.map(u => {
						const uiType = u.path ? u.path.split('/').pop() : u;

						return new Promise(res => {
							const doneCheck = () => {
								const isDone = this.uis.some(ui => ui.type === uiType);
								if (isDone) {
									res();

									return;
								}

								setTimeout(doneCheck, 100);
							};

							this.build(uiType, { path: u.path });

							doneCheck();
						});
					})
				);

				this.ingameUisBuilt = true;
			}

			client.request({
				threadModule: 'instancer',
				method: 'clientAck',
				data: {}
			});
		},

		buildModUi: function (config) {
			const type = config.path.split('/').pop();

			this.build(type, {
				path: config.path
			});
		},

		build: function (type, options) {
			let className = 'ui' + type[0].toUpperCase() + type.substr(1);
			let el = $('.' + className);
			if (el.length > 0)
				return;

			this.getTemplate(type, options);
		},

		getTemplate: function (type, options) {
			let path = null;
			if (options && options.path)
				path = options.path + `\\${type}.js`;
			else
				path = this.root + 'ui/templates/' + type + '/' + type;
		
			require([path], this.onGetTemplate.bind(this, options, type));
		},
		
		onGetTemplate: function (options, type, template) {
			let ui = $.extend(true, { type }, uiBase, template);
			ui.setOptions(options);
		
			requestAnimationFrame(this.renderUi.bind(this, ui));
		},

		renderUi: function (ui) {
			ui.render();
			ui.el.data('ui', ui);

			this.uis.push(ui);
		},

		onResize: function () {
			this.uis.forEach(function (ui) {
				if (ui.centered)
					ui.center();
				else if ((ui.centeredX) || (ui.centeredY))
					ui.center(ui.centeredX, ui.centeredY);
			}, this);
		},

		onUiKeyDown: function (keyEvent) {
			if (keyEvent.key === 'esc') {
				this.uis.forEach(u => {
					if (!u.modal || !u.shown)
						return;

					keyEvent.consumed = true;
					u.toggle();
				});
				
				$('.uiOverlay').hide();
				events.emit('onHideContextMenu');
			} else if (['o', 'j', 'h', 'i'].indexOf(keyEvent.key) > -1)
				$('.uiOverlay').hide();
		},

		preload: function () {
			require([
				'death',
				'dialogue',
				'equipment',
				'events',
				'hud',
				'inventory',
				'overlay',
				'passives',
				'quests',
				'reputation',
				'stash'
			].map(m => 'ui/templates/' + m + '/' + m), this.afterPreload.bind(this));
		},

		afterPreload: function () {
			if (!globals.clientConfig.tos.required || tosAcceptanceValid()) {
				this.build('characters');

				return;
			}

			this.build('terms');
		},

		update: function () {
			let uis = this.uis;
			let uLen = uis.length;
			for (let i = 0; i < uLen; i++) {
				let u = uis[i];
				if (u.update)
					u.update();
			}
		},

		exitGame: function () {
			$('[class^="ui"]:not(.ui-container)').toArray().forEach(el => {
				let ui = $(el).data('ui');
				if (ui && ui.destroy)
					ui.destroy();
			});

			this.ingameUisBuilt = false;
		},

		getUi: function (type) {
			return this.uis.find(u => u.type === type);
		}
	};
});
