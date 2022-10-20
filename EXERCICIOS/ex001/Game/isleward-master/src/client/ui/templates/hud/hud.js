define([
	'js/system/events',
	'html!ui/templates/hud/template',
	'css!ui/templates/hud/styles',
	'js/system/client',
	'ui/shared/renderItem'
], function (
	events,
	template,
	styles,
	client,
	renderItem
) {
	return {
		tpl: template,

		stats: null,
		items: null,

		quickItem: null,

		postRender: function () {
			this.onEvent('onGetStats', this.events.onGetStats.bind(this));
			this.onEvent('onGetPortrait', this.events.onGetPortrait.bind(this));
			this.onEvent('onGetItems', this.events.onGetItems.bind(this));
			this.onEvent('onDestroyItems', this.events.onDestroyItems.bind(this));
			this.onEvent('onKeyDown', this.events.onKeyDown.bind(this));

			this.find('.quickItem')
				.on('mousemove', this.showQuickItemTooltip.bind(this, true))
				.on('mouseleave', this.showQuickItemTooltip.bind(this, false))
				.on('click', this.useQuickItem.bind(this));
		},

		build: function () {
			let stats = this.stats;

			let boxes = this.find('.statBox');

			[
				stats.hp / stats.hpMax,
				stats.mana / stats.manaMax,
				stats.xp / stats.xpMax
			].forEach((s, i) => boxes.eq(i).find('div:first-child').width(Math.max(0, Math.min(100, ~~(s * 100))) + '%'));

			this.find('.statManaReserve').width(Math.max(0, Math.min(100, ~~(stats.manaReservePercent * 100))) + '%');

			boxes.eq(0).find('.text').html(Math.floor(stats.hp) + '/' + ~~stats.hpMax);
			boxes.eq(1).find('.text').html(Math.floor(stats.mana) + '/' + ~~stats.manaMax);
			boxes.eq(2).find('.text').html('level: ' + stats.level);
		},

		useQuickItem: function () {
			const quickItem = this.items.find(f => f.has('quickSlot'));
			if (!quickItem)
				return;

			events.emit('onHideItemTooltip', quickItem);
			events.emit('onUseQuickItem', quickItem);

			client.request({
				cpn: 'player',
				method: 'performAction',
				data: {
					cpn: 'equipment',
					method: 'useQuickSlot',
					data: {
						slot: 0
					}
				}
			});
		},

		showQuickItemTooltip: function (show, e) {
			const item = this.quickItem;

			if (show) {
				let ttPos = null;
				if (e) {
					ttPos = {
						x: ~~(e.clientX + 32),
						y: ~~(e.clientY)
					};
				}

				events.emit('onShowItemTooltip', item, ttPos);
			} else
				events.emit('onHideItemTooltip', item);
		},

		events: {
			onGetStats: function (stats) {
				this.stats = stats;
				this.build();
			},

			onGetPortrait: function (portrait) {
				let spritesheet = portrait.spritesheet || '../../../images/portraitIcons.png';

				let x = portrait.x * -64;
				let y = portrait.y * -64;

				this.find('.portrait')
					.css({
						background: 'url("' + spritesheet + '") ' + x + 'px ' + y + 'px',
						visibility: 'visible'
					});
			},

			onDestroyItems: function (itemIds) {
				const quickItem = this.items.find(f => f.has('quickSlot'));
				if (!quickItem || itemIds.includes(quickItem.id)) {
					this.find('.quickItem')
						.hide()
						.find('.icon')
						.css('background', '');

					if (quickItem)
						events.emit('onHideItemTooltip', quickItem);
				}
			},

			onGetItems: function (items) {
				this.items = items;

				const quickItem = items.find(f => f.has('quickSlot'));
				this.quickItem = quickItem;
				if (!quickItem) {
					const oldQuickItem = this.find('.quickItem').data('item');
					if (oldQuickItem)
						events.emit('onHideItemTooltip', oldQuickItem);

					this.find('.quickItem')
						.hide()
						.removeData('item')
						.find('.icon')
						.css('background', '');
					return;
				}

				const itemContainer = this.find('.quickItem').show();
				const itemEl = renderItem(null, quickItem, itemContainer);

				if (itemEl.data('item') && itemEl.data('item').id === quickItem.id)
					return;

				itemEl.data('item', quickItem);
			},

			onKeyDown: function (key) {
				if (key === 'r')
					this.useQuickItem();
			}
		}
	};
});
