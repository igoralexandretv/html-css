define([
	'js/system/events',
	'js/system/client',
	'js/system/globals',
	'html!ui/templates/online/template',
	'css!ui/templates/online/styles',
	'html!ui/templates/online/templateListItem'
], function (
	events,
	client,
	globals,
	template,
	styles,
	templateListItem
) {
	return {
		tpl: template,
		centered: true,

		onlineList: [],

		modal: true,
		hasClose: true,

		actions: [],

		postRender: function () {
			globals.onlineList = this.onlineList;

			this.onEvent('onGetConnectedPlayer', this.onGetConnectedPlayer.bind(this));
			this.onEvent('onGetDisconnectedPlayer', this.onGetDisconnectedPlayer.bind(this));

			this.onEvent('onGetSocialActions', this.onGetSocialActions.bind(this));

			this.onEvent('onKeyDown', this.onKeyDown.bind(this));
			this.onEvent('onShowOnline', this.toggle.bind(this));
		},

		onGetSocialActions: function (actions) {
			this.actions = actions;
		},

		onKeyDown: function (key) {
			if (key === 'o')
				this.toggle();
		},

		onAfterShow: function () {
			this.build();
		},

		onGetConnectedPlayer: function (list) {
			if (!list.length)
				list = [list];

			let onlineList = this.onlineList;

			list.forEach(function (l) {
				let exists = onlineList.find(function (o) {
					return (o.name === l.name);
				});
				if (exists)
					$.extend(true, exists, l);
				else
					onlineList.push(l);
			});

			onlineList
				.sort(function (a, b) {
					if (a.level === b.level) {
						if (a.name > b.name)
							return 1;
						return -1;
					} return b.level - a.level;
				});

			if (this.shown)
				this.build();
		},

		onGetDisconnectedPlayer: function (playerName) {
			let onlineList = this.onlineList;

			onlineList.spliceWhere(function (o) {
				return (o.name === playerName);
			});

			if (this.shown)
				this.build();
		},

		build: function () {
			let headingText = this.el.find('.heading-text');
			let playerCount = this.onlineList.length;
			headingText.html(`online players (${playerCount})`);

			let container = this.el.find('.list');
			container
				.children(':not(.heading)')
				.remove();

			this.onlineList.forEach(function (l) {
				let html = templateListItem
					.replace('$NAME$', l.name)
					.replace('$LEVEL$', l.level)
					.replace('$CLASS$', l.class);

				let el = $(html)
					.appendTo(container)
					.on('contextmenu', this.showContext.bind(this, l));

				if (isMobile)
					el.on('mousedown', this.showContext.bind(this, l));
			}, this);
		},

		showContext: function (char, e) {
			if (char.name !== window.player.name) {
				const extraActions = this.actions.map(({ command, text }) => {
					return {
						text,
						callback: this.performAction.bind(this, command, char.name)
					};
				});

				const isBlocked = window.player.social.isPlayerBlocked(char.name);

				const actions = [{
					text: 'invite to party',
					callback: this.invite.bind(this, char.id)
				}, {
					text: 'whisper',
					callback: events.emit.bind(events, 'onDoWhisper', char.name)
				}, {
					text: isBlocked ? 'unblock' : 'block',
					callback: this.block.bind(this, char.name)
				}, ...extraActions];

				events.emit('onBeforeOnlineListContext', char.id, actions);
			
				events.emit('onContextMenu', actions, e);
			}

			e.preventDefault();
			return false;
		},

		performAction: function (command, charName) {
			client.request({
				cpn: 'social',
				method: 'chat',
				data: {
					message: `/${command} ${charName}`
				}
			});
		},

		block: function (charName) {
			const isBlocked = window.player.social.isPlayerBlocked(charName);
			let method = isBlocked ? 'unblock' : 'block';

			this.performAction(method, charName);
		},

		invite: function (charId) {
			this.hide();

			client.request({
				cpn: 'social',
				method: 'getInvite',
				data: {
					targetId: charId
				}
			});
		}
	};
});
