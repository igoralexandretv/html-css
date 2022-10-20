define([
	'js/system/events',
	'html!ui/templates/messages/template',
	'html!ui/templates/messages/tplTab',
	'css!ui/templates/messages/styles',
	'ui/templates/messages/mobile',
	'ui/templates/messages/channelPicker',
	'js/input',
	'js/system/client',
	'js/config'
], function (
	events,
	template,
	tplTab,
	styles,
	messagesMobile,
	channelPicker,
	input,
	client,
	config
) {
	return {
		tpl: template,

		maxChatLength: 255,

		hoverItem: null,

		hoverFilter: false,

		currentChannel: 'global',
		currentSubChannel: null,

		privateChannels: [],
		lastPrivateChannel: null,
		customChannels: [],
		lastCustomChannel: null,

		postRender: function () {
			[
				'onGetMessages',
				'onDoWhisper',
				'onJoinChannel',
				'onLeaveChannel',
				'onClickFilter',
				'onGetCustomChatChannels',
				'onKeyDown',
				'onKeyUp'
			].forEach(e => this.onEvent(e, this[e].bind(this)));

			this.find('.filter:not(.channel)').on('click', this.onClickFilter.bind(this));

			channelPicker.init.call(this);

			if (isMobile)
				messagesMobile.init.call(this);
			else {
				this.find('input')
					.on('keydown', this.sendChat.bind(this))
					.on('input', this.enforceMaxMsgLength.bind(this))
					.on('blur', this.toggle.bind(this, false, true));
			}
		},

		update: function () {
			if (isMobile)
				return;
			
			if (this.el.hasClass('typing'))
				return;

			const time = new Date();
			const hours = time.getUTCHours().toString().padStart(2, 0);
			const minutes = time.getUTCMinutes().toString().padStart(2, 0);

			let elTime = this.find('.time');
			const timeString = `[ ${hours}:${minutes} ]`;

			if (elTime.html() !== timeString)
				elTime.html(timeString);
		},

		enforceMaxMsgLength: function () {
			let textbox = this.find('input');
			let val = textbox.val();

			if (val.length <= this.maxChatLength)
				return;

			val = val.substr(0, this.maxChatLength);
			textbox.val(val);
		},

		onGetCustomChatChannels: function (channels) {
			channels.forEach(c => this.onJoinChannel(c));
		},

		onJoinChannel: function (channel) {
			const container = this.find('.filters');

			const channelName = channel.trim();

			this.customChannels.spliceWhere(c => c === channel);
			this.find(`[filter="${channelName}"]`).remove();

			this.customChannels.push(channel);

			$(tplTab)
				.appendTo(container)
				.addClass('channel')
				.attr('filter', channelName)
				.html(channelName)
				.on('mouseover', this.onFilterHover.bind(this, true))
				.on('mouseleave', this.onFilterHover.bind(this, false))
				.on('click', this.onClickFilter.bind(this));
		},

		onLeaveChannel: function (channel) {
			this.customChannels.spliceWhere(c => c === channel);

			this.find(`.filters div[filter="${channel}"]`).remove();
		},

		onFilterHover: function (hover) {
			this.hoverFilter = hover;
		},

		onClickFilter: function (e) {
			let el = $(e.target);
			el.toggleClass('active');

			let filter = el.attr('filter');
			let method = (el.hasClass('active') ? 'show' : 'hide');

			if (method === 'show')
				this.find('.list').addClass(filter);
			else
				this.find('.list').removeClass(filter);

			if (el.hasClass('channel')) 
				this.find('.list .' + filter)[method]();
		},

		onKeyDown: function (key) {
			if (key === 'enter') 
				this.toggle(true);
			else if (key === 'shift')
				this.showItemTooltip();
			else if (key === 'esc' && this.el.hasClass('typing'))
				this.toggle(false);
		},

		onKeyUp: function (key) {
			if (key === 'shift')
				this.showItemTooltip();
		},

		onDoWhisper: function (charName) {
			this.toggle(true);

			this.currentChannel = 'direct';
			this.currentSubChannel = charName;

			this.find('.channelPicker').html(charName);

			const elInput = this.find('input')
				.val('message')
				.focus();

			elInput[0].setSelectionRange(0, 7);
		},

		//Remember private and custom channels used
		trackHistory: function (msg) {
			const { subType, source, target, channel } = msg;

			if (subType === 'privateIn' || subType === 'privateOut') {
				const list = this.privateChannels;
				list.spliceWhere(l => l === source || l === target);

				//Newest sources are always at the end
				list.push(source || target);

				if (list.length > 5)
					list.splice(0, list.length - 5);

				if (subType === 'privateOut' && config.rememberChatChannel)
					this.lastPrivateChannel = target;
			} else if (subType === 'custom' && config.rememberChatChannel)
				this.lastCustomChannel = channel;
		},

		onGetMessages: function (e) {
			if (!window.player)
				return;
			
			let messages = e.messages;
			if (!messages.length)
				messages = [messages];

			let container = this.find('.list');

			const [ { scrollHeight, clientHeight, scrollTop } ] = container;
			const isAtMaxScroll = scrollTop >= (scrollHeight - clientHeight);

			messages.forEach(m => {
				this.trackHistory(m);

				let message = m.message;

				if (m.source) {
					if (window.player.social.isPlayerBlocked(m.source))
						return;
				}

				if (m.item) {
					let source = message.split(':')[0];
					message = source + ': <span class="q' + (m.item.quality || 0) + '">' + message.replace(source + ': ', '') + '</span>';
				}

				let el = $('<div class="list-message ' + m.class + '">' + message + '</div>')
					.appendTo(container);

				if (m.has('type'))
					el.addClass(m.type);
				else
					el.addClass('info');

				if (m.has('channel'))
					el.addClass(m.channel);

				if (m.item) {
					let clickHander = () => {};
					let moveHandler = this.showItemTooltip.bind(this, el, m.item);
					if (isMobile) 
						[clickHander, moveHandler] = [moveHandler, clickHander];

					el.find('span')
						.on('mousemove', moveHandler)
						.on('mousedown', clickHander)
						.on('mouseleave', this.hideItemTooltip.bind(this));
				}

				if (m.type) {
					const isChannel = m?.subType === 'custom';
					if (isChannel) {
						if (this.find('.filter[filter="' + m.channel + '"]').hasClass('active'))
							el.show();
						else
							el.hide();
					}

					if (isMobile && ['loot', 'info'].indexOf(m.type) !== -1) {
						events.emit('onGetAnnouncement', {
							msg: m.message
						});
					}
				}
			});

			if (!this.el.hasClass('typing') || isAtMaxScroll)
				container.scrollTop(9999999);
		},

		hideItemTooltip: function () {
			if (this.dragEl) {
				this.hoverCell = null;
				return;
			}

			events.emit('onHideItemTooltip', this.hoverItem);
			this.hoverItem = null;
		},

		showItemTooltip: function (el, item, e) {
			if (item)
				this.hoverItem = item;
			else
				item = this.hoverItem;

			if (!item)
				return;

			let ttPos = null;
			if (el) {
				ttPos = {
					x: ~~(e.clientX + 32),
					y: ~~(e.clientY)
				};
			}

			let bottomAlign = !isMobile;

			events.emit('onShowItemTooltip', item, ttPos, true, bottomAlign);
		},

		toggle: function (show, isFake, e) {
			if (isFake && this.hoverFilter)
				return;

			input.resetKeys();

			this.el.removeClass('typing');
			this.el.find('.main').removeClass('hasBorderShadow');

			let textbox = this.find('input');

			if (show) {
				this.el.addClass('typing');
				this.el.find('.main').addClass('hasBorderShadow');

				if (!config.rememberChatChannel) {
					this.currentChannel = 'global';
					this.currentSubChannel = null;
				}

				this.find('.channelPicker').html(this.currentSubChannel || this.currentChannel);
				textbox.focus();
				this.find('.list').scrollTop(9999999);
			} else {
				this.find('.channelOptions').removeClass('active');
				textbox.val('');
				this.el.removeClass('picking');

				if (['direct', 'custom'].includes(this.currentChannel) && (!this.currentSubChannel || ['join new', 'leave'].includes(this.currentSubChannel))) {
					this.currentSubChannel = null;
					this.currentChannel = 'global';
				}
			}

			if (e)
				e.stopPropagation();
		},

		sendChat: function (e) {
			let textbox = this.find('input');
			let msgConfig = {
				success: true,
				message: textbox.val(),
				event: e,
				cancel: false
			};

			this.processChat(msgConfig);
			if (msgConfig.cancel || this.el.hasClass('picking'))
				return false;

			const { which: charCode } = e;

			if ([9, 27].includes(charCode) || charCode !== 13) {
				if (charCode === 9) {
					e.preventDefault();
					textbox.val(`${textbox.val()}    `);
				} else if (charCode === 27)
					this.toggle(false);

				return;
			}

			events.emit('onBeforeChat', msgConfig);

			let val = msgConfig.message
				.split('<').join('&lt;')
				.split('>').join('&gt;');

			if (!msgConfig.success) {
				this.toggle(false);
				return;
			}

			if (val.trim() === '') {
				this.toggle(false);
				return;
			}

			client.request({
				cpn: 'social',
				method: 'chat',
				data: {
					message: val,
					type: this.currentChannel,
					subType: this.currentSubChannel
				}
			});

			this.toggle();
		}
	};
});
