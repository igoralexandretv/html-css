define([
	'js/system/events',
	'html!ui/templates/options/template',
	'css!ui/templates/options/styles',
	'js/rendering/renderer',
	'ui/factory',
	'js/objects/objects',
	'js/system/client',
	'js/sound/sound',
	'js/config'
], function (
	events,
	template,
	styles,
	renderer,
	factory,
	objects,
	client,
	sound,
	config
) {
	return {
		tpl: template,
		centered: true,

		modal: true,
		hasClose: true,

		isFlex: true,

		postRender: function () {
			this.onEvent('onOpenOptions', this.show.bind(this));

			this.find('.item.nameplates .name').on('click', events.emit.bind(events, 'onUiKeyDown', { key: 'v' }));
			this.find('.item.quests .name').on('click', this.toggleQuests.bind(this));
			this.find('.item.events .name').on('click', this.toggleEvents.bind(this));
			this.find('.item.quality .name').on('click', this.toggleQualityIndicators.bind(this));
			this.find('.item.unusable .name').on('click', this.toggleUnusableIndicators.bind(this));
			this.find('.item.lastChannel .name').on('click', this.toggleLastChannel.bind(this));
			this.find('.item.partyView .name').on('click', this.togglePartyView.bind(this));
			this.find('.item.damageNumbers .name').on('click', this.toggleDamageNumbers.bind(this));

			//Can only toggle fullscreen directly in a listener, not deferred the way jQuery does it,
			// so we register this handler in a different way
			this.find('.item.screen .name')[0].addEventListener('click', this.toggleScreen.bind(this));

			this.find('.item.volume .btn').on('click', this.modifyVolume.bind(this));

			[
				'onResize',
				'onUiKeyDown',
				'onToggleNameplates',
				'onToggleQualityIndicators',
				'onToggleUnusableIndicators',
				'onToggleEventsVisibility',
				'onToggleQuestsVisibility',
				'onToggleLastChannel',
				'onVolumeChange',
				'onTogglePartyView',
				'onToggleDamageNumbers'
			].forEach(e => {
				this.onEvent(e, this[e].bind(this));
			});

			this.find('.item').on('click', events.emit.bind(events, 'onClickOptionsItem'));
		},

		modifyVolume: function (e) {
			const el = $(e.target);

			const isIncrease = el.hasClass('increase');
			const delta = isIncrease ? 10 : -10;
			
			const soundType = el.parent().parent().hasClass('sound') ? 'sound' : 'music';

			events.emit('onManipulateVolume', {
				soundType,
				delta
			});
		},

		toggleUnusableIndicators: function () {
			config.toggle('unusableIndicators');

			if (config.unusableIndicators === 'background' && config.qualityIndicators === 'background') {
				config.toggle('qualityIndicators');
				events.emit('onToggleQualityIndicators', config.qualityIndicators);
			}

			events.emit('onToggleUnusableIndicators', config.unusableIndicators);
		},

		onToggleUnusableIndicators: function (state) {
			const newValue = state[0].toUpperCase() + state.substr(1);

			this.find('.item.unusable .value').html(newValue);
		},

		toggleQualityIndicators: function () {
			config.toggle('qualityIndicators');

			if (config.qualityIndicators === 'background' && config.unusableIndicators === 'background') {
				config.toggle('unusableIndicators');
				events.emit('onToggleUnusableIndicators', config.unusableIndicators);
			}

			events.emit('onToggleQualityIndicators', config.qualityIndicators);
		},

		onToggleQualityIndicators: function (state) {
			const newValue = state[0].toUpperCase() + state.substr(1);

			this.find('.item.quality .value').html(newValue);
		},

		toggleScreen: function () {
			const state = renderer.toggleScreen();
			const newValue = (state === 'Windowed') ? 'Off' : 'On';

			this.find('.item.screen .value').html(newValue);
		},

		toggleEvents: function () {
			config.toggle('showEvents');

			events.emit('onToggleEventsVisibility', config.showEvents);
		},

		toggleQuests: function () {
			config.toggle('showQuests');

			events.emit('onToggleQuestsVisibility', config.showQuests);
		},

		onToggleEventsVisibility: function (state) {
			const newValue = state ? 'On' : 'Off';

			this.find('.item.events .value').html(newValue);
		},

		onToggleQuestsVisibility: function (state) {
			const newValue = state[0].toUpperCase() + state.substr(1);

			this.find('.item.quests .value').html(newValue);
		},

		onResize: function () {
			let isFullscreen = (window.innerHeight === screen.height);
			const newValue = isFullscreen ? 'On' : 'Off';

			this.find('.item.screen .value').html(newValue);
		},

		onToggleNameplates: function (state) {
			const newValue = state ? 'On' : 'Off';

			this.find('.item.nameplates .value').html(newValue);
		},

		toggleAudio: function () {
			config.toggle('playAudio');

			events.emit('onToggleAudio', config.playAudio);
		},

		onToggleAudio: function (isAudioOn) {
			const newValue = isAudioOn ? 'On' : 'Off';

			this.find('.item.audio .value').html(newValue);
		},

		toggleLastChannel: function () {
			config.toggle('rememberChatChannel');

			events.emit('onToggleLastChannel', config.rememberChatChannel);
		},

		onToggleLastChannel: function (state) {
			const newValue = state ? 'On' : 'Off';

			this.find('.item.lastChannel .value').html(newValue);
		},

		togglePartyView: function () {
			config.toggle('partyView');

			events.emit('onTogglePartyView', config.partyView);
		},

		onTogglePartyView: function (state) {
			const newValue = state[0].toUpperCase() + state.substr(1);

			this.find('.item.partyView .value').html(newValue);
		},

		toggleDamageNumbers: function () {
			config.toggle('damageNumbers');

			events.emit('onToggleDamageNumbers', config.damageNumbers);
		},

		onToggleDamageNumbers: function (state) {
			const newValue = state[0].toUpperCase() + state.substr(1);

			this.find('.item.damageNumbers .value').html(newValue);
		},

		onVolumeChange: function ({ soundType, volume }) {
			const item = this.find(`.item.volume.${soundType}`);
			
			item.find('.value').html(volume);

			const tickLeftPosition = `${volume}%`;
			item.find('.tick').css({ left: tickLeftPosition });
			
			const btnDecrease = item.find('.btn.decrease').removeClass('disabled');
			const btnIncrease = item.find('.btn.increase').removeClass('disabled');

			if (volume === 0)
				btnDecrease.addClass('disabled');
			else if (volume === 100)
				btnIncrease.addClass('disabled');

			const configKey = `${soundType}Volume`;
			config.set(configKey, volume);
		},

		build: function () {
			this.onToggleNameplates(config.showNames);
			this.onToggleAudio(config.playAudio);
			this.onToggleEventsVisibility(config.showEvents);
			this.onToggleQuestsVisibility(config.showQuests);
			this.onToggleQualityIndicators(config.qualityIndicators);
			this.onToggleUnusableIndicators(config.unusableIndicators);
			this.onToggleLastChannel(config.rememberChatChannel);
			this.onTogglePartyView(config.partyView);
			this.onToggleDamageNumbers(config.damageNumbers);
			
			this.onVolumeChange({
				soundType: 'sound',
				volume: config.soundVolume
			});

			this.onVolumeChange({
				soundType: 'music',
				volume: config.musicVolume
			});
		},

		onAfterShow: function () {
			this.onResize();

			this.build();
		},
        
		onUiKeyDown: function (keyEvent) {
			const { key } = keyEvent;
	
			if (key === 'v') {
				config.toggle('showNames');

				events.emit('onToggleNameplates', config.showNames);

				const newValue = config.showNames ? 'On' : 'Off';
				this.find('.item.nameplates .value').html(newValue);
			}
		},

		afterHide: function () {
			this.onResize();

			events.emit('onCloseOptions');
		}
	};
});
