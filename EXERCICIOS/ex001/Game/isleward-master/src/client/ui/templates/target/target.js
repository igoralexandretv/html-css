define([
	'js/system/client',
	'js/system/events',
	'js/system/globals',
	'html!ui/templates/target/template',
	'css!ui/templates/target/styles'
], function (
	client,
	events,
	globals,
	template,
	styles
) {
	return {
		tpl: template,

		target: null,
		lastHp: null,
		lastMana: null,
		lastLevel: null,

		postRender: function () {
			this.onEvent('onSetTarget', this.onSetTarget.bind(this));
			this.onEvent('onDeath', this.onSetTarget.bind(this, null));
			this.onEvent('onGetTargetCasting', this.onGetTargetCasting.bind(this));

			if (isMobile) 
				this.el.on('click', this.onContextMenu.bind(this));
		},

		onGetTargetCasting: function (objId, casting) {
			if (!this.target || this.target.id !== objId)
				return;

			let box = this.el.find('.statBox')
				.eq(2);

			if ((casting === 0) || (casting === 1)) {
				box.hide();
				return;
			} 

			box.show();

			let w = ~~(casting * 100);
			box.find('[class^="stat"]').css('width', w + '%');
		},

		onContextMenu: function (e) {
			//If we access this method on mobile, we don't go through the event manager
			// and as such, we just have the original browser event by default
			const originalEvent = e.event ? e.event : e;

			let target = this.target;
			//This is kind of a hack. We check if the target has a prophecies component since we can't check for
			// target.player (only the logged-in player has a player component)
			if (!target || !target.dialogue || target === window.player || target.prophecies) {
				if (target.prophecies) {
					const inspectContext = [
						target.name,
						'----------', {
							text: 'inspect',
							callback: this.onInspect.bind(this)
						}
					];

					globals.clientConfig.contextMenuActions.player.forEach(action => {
						inspectContext.push({
							text: action.text,
							callback: this.onAction.bind(this, action, true)
						});
					});

					events.emit('onBeforePlayerContext', target, inspectContext);

					events.emit('onContextMenu', inspectContext, originalEvent);
				}

				return;
			}

			const talkContext = [
				target.name,
				'----------', {
					text: 'talk',
					callback: this.onTalk.bind(this)
				}
			];

			globals.clientConfig.contextMenuActions.npc.forEach(action => {
				talkContext.push({
					text: action.text,
					callback: this.onAction.bind(this, action, false)
				});
			});

			events.emit('onBeforeNpcContext', target, talkContext);

			events.emit('onContextMenu', talkContext, originalEvent);

			//Cancel the default right click action on desktop
			if (originalEvent.button === 2)
				originalEvent.preventDefault();

			return false;
		},

		onTalk: function () {
			window.player.dialogue.talk(this.target);
		},

		onAction: function (action, sendTargetServerId) {
			const { threadModule, module: actionModule, cpn, method, data = {} } = action;
			if (method === 'performAction')
				data.data.playerId = this.target.id;
			else if (actionModule || threadModule)
				data.targetId = sendTargetServerId ? this.target.serverId : this.target.id;

			client.request({
				module: actionModule,
				threadModule,
				cpn,
				method,
				data
			});
		},

		onInspect: function () {
			client.request({
				cpn: 'player',
				method: 'performAction',
				data: {
					cpn: 'equipment',
					method: 'inspect',
					data: {
						playerId: this.target.id
					}
				}
			});
		},

		onSetTarget: function (target, e) {
			this.target = target;
			this.el.find('.statBox')
				.eq(2)
				.hide();

			if (!this.target) {
				this.lastHp = null;
				this.lastMana = null;
				this.lastLevel = null;
				this.el.hide();
			} else {
				let el = this.el;
				el.find('.infoName').html(target.name);
				el.find('.infoLevel')
					.html('(' + target.stats.values.level + ')')
					.removeClass('high-level');

				let crushing = (target.stats.values.level - 5 >= window.player.stats.values.level);
				if (crushing)
					el.find('.infoLevel').addClass('high-level');

				el.show();
			}

			if (e && e.button === 2 && this.target)
				this.onContextMenu(e);
		},

		buildBar: function (barIndex, value, max) {
			let box = this.el.find('.statBox').eq(barIndex);

			let w = ~~((value / max) * 100);
			box.find('[class^="stat"]').css('width', w + '%');

			box.find('.text').html(Math.floor(value) + '/' + Math.floor(max));
		},

		update: function () {
			let target = this.target;

			if (!target)
				return;

			if (target.destroyed) {
				this.onSetTarget();
				return;
			}

			let stats = target.stats.values;

			if (stats.level !== this.lastLevel) {
				this.el.find('.infoLevel')
					.html('(' + stats.level + ')')
					.removeClass('high-level');

				let crushing = (stats.level - 5 >= window.player.stats.level);
				if (crushing)
					this.el.find('.infoLevel').addClass('high-level');
			}

			if (stats.hp !== this.lastHp) {
				this.buildBar(0, stats.hp, stats.hpMax);
				this.lastHp = stats.hp;
			}

			if (stats.mana !== this.lastMana) {
				this.buildBar(1, stats.mana, stats.manaMax);
				this.lastMana = stats.mana;
			}
		}
	};
});
