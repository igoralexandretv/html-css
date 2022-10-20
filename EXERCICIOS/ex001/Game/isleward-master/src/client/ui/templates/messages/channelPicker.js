define([
	'html!ui/templates/messages/tplTab'
], function (
	tplTab
) {
	const extensionObj = {
		processChat: function (msgConfig) {
			const { message, event: keyboardEvent } = msgConfig;
			const { key } = keyboardEvent;
			const { el, currentChannel } = this;

			const optionContainer = this.find('.channelOptions');

			if (message.length) {
				if (el.hasClass('picking')) 
					msgConfig.cancel = true;
				
				return;
			}
			
			if (key === 'Enter') {
				const selectedSubPick = optionContainer.find('.option.selected');
				if (selectedSubPick.length) {
					this.onPickSubChannel(selectedSubPick.html(), currentChannel);
					return;
				}
			}

			//If we're busy picking a sub channel, we can use keyboard nav
			const isPicking = el.hasClass('picking');
			const currentSelection = optionContainer.find('.option.selected');
			if (isPicking && currentSelection.length) {
				const delta = {
					ArrowUp: -1,
					ArrowDown: 1
				}[key];

				if (delta) {
					const options = optionContainer.find('.option');
					const currentIndex = currentSelection.eq(0).index();
					let nextIndex = (currentIndex + delta) % options.length;
					currentSelection.removeClass('selected');
					options.eq(nextIndex).addClass('selected');
				}
			}

			const pick = {
				'%': 'party',
				'!': 'global',
				$: 'custom',
				'@': 'direct'
			}[key];

			if (!pick) {
				if (isPicking)
					msgConfig.cancel = true;

				return;
			}

			if (currentChannel === pick) {
				if (pick === 'direct')
					this.lastPrivateChannel = null;
				else if (pick === 'custom')
					this.lastCustomChannel = null;
			}

			this.onPickChannel(pick, true);
			msgConfig.cancel = true;
		},

		onPickChannel: function (channel, autoPickSub) {
			this.currentChannel = channel;
			this.currentSubChannel = null;

			const showSubChannels = (
				['direct', 'custom'].includes(channel) &&
				(
					!autoPickSub ||
					(
						channel === 'direct' &&
						!this.lastPrivateChannel
					) ||
					(
						channel === 'custom' &&
						!this.lastCustomChannel
					)
				)
			);

			if (!showSubChannels) {
				this.find('.channelOptions').removeClass('active');

				let showValue = {
					direct: this.lastPrivateChannel,
					custom: this.lastCustomChannel
				}[channel];

				if (channel === 'direct' || channel === 'custom')
					this.currentSubChannel = showValue;

				showValue = showValue || channel;

				this.find('.channelPicker').html(showValue);

				this.find('input').focus();

				this.el.removeClass('picking');
			} else
				this.onShowChannelOptions(channel);
		},

		onPickSubChannel: function (subChannel, channel) {
			this.currentSubChannel = subChannel;
			this.find('.channelOptions').removeClass('active');
			this.find('.channelPicker').html(subChannel);

			const elInput = this.find('input');

			elInput.focus();

			if (channel === 'custom') {
				if (subChannel === 'join new') {
					elInput.val('/join channelName');
					elInput[0].setSelectionRange(6, 17);
				} else if (subChannel === 'leave') {
					elInput.val('/leave channelName');
					elInput[0].setSelectionRange(7, 18);
				}
			}

			this.el.removeClass('picking');
		},

		onShowChannelOptions: function (currentPick) {
			const optionContainer = this.find('.channelOptions')
				.addClass('active')
				.empty();

			const options = [];
			let handlerOnClick = this.onPickChannel;

			this.el.addClass('picking');

			if (!currentPick) {
				options.push('global', 'custom');

				if (this.privateChannels.length)
					options.push('direct');

				//Hack...surely we can find a more sane way to do this
				if ($('.uiParty .member').length)
					options.push('party');
			} else {
				handlerOnClick = this.onPickSubChannel;
				
				if (currentPick === 'direct')
					options.push(...this.privateChannels);
				else if (currentPick === 'custom')
					options.push(...this.customChannels, 'join new', 'leave');
			}

			if (!options.length) {
				this.onPickChannel('global');
				return;
			}
			
			let addSelectStyleTo = null;
			if (currentPick)
				addSelectStyleTo = this.currentSubChannel || options[0];
			options.forEach(o => {
				const shortcut = {
					global: ' (!)',
					direct: ' (@)',
					party: ' (%)',
					custom: ' ($)'
				}[o] || '';

				const html = `<div class='option' shortcut='${shortcut}'>${o}</div>`;

				const el = $(html)
					.appendTo(optionContainer)
					.on('click', handlerOnClick.bind(this, o, currentPick))
					.on('hover', this.stopKeyboardNavForOptions.bind(this));

				if (o === addSelectStyleTo)
					el.addClass('selected');
			});
		},

		stopKeyboardNavForOptions: function () {
			this.find('.channelOptions .option.selected').removeClass('selected');
		}
	};

	return {
		init: function () {
			$.extend(this, extensionObj);

			//This whole hoverFilter business is a filthy hack
			this.find('.channelPicker, .channelOptions, .filter:not(.channel)')
				.on('mouseover', this.onFilterHover.bind(this, true))
				.on('mouseleave', this.onFilterHover.bind(this, false));

			this.find('.channelPicker').on('click', this.onShowChannelOptions.bind(this, null));
		}
	};
});
