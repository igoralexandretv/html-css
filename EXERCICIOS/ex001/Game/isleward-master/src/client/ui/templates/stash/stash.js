define([
	'js/system/events',
	'js/system/client',
	'html!ui/templates/stash/template',
	'css!ui/templates/stash/styles',
	'html!ui/templates/inventory/templateItem',
	'js/input',
	'ui/shared/renderItem'
], function (
	events,
	client,
	template,
	styles,
	tplItem,
	input,
	renderItem
) {
	return {
		tpl: template,

		centered: true,
		hoverItem: null,

		items: [],
		maxItems: null,

		modal: true,
		hasClose: true,

		postRender: function () {
			[
				'onKeyUp',
				'onKeyDown',
				'onOpenStash',
				'onAddStashItems',
				'onRemoveStashItems'
			]
				.forEach(e => {
					this.onEvent(e, this[e].bind(this));
				});
		},

		build: function () {
			const { el, maxItems, items } = this;

			el.removeClass('scrolls');
			if (maxItems > 50)
				el.addClass('scrolls');

			const container = this.el.find('.grid').empty();

			const renderItemCount = Math.max(items.length, maxItems);

			for (let i = 0; i < renderItemCount; i++) {
				const item = items[i];
				const itemEl = renderItem(container, item);

				if (!item)
					continue;

				let moveHandler = this.onHover.bind(this, itemEl, item);
				let downHandler = () => {};
				if (isMobile) {
					moveHandler = () => {};
					downHandler = this.onHover.bind(this, itemEl, item);
				}

				itemEl
					.data('item', item)
					.on('mousedown', downHandler)
					.on('mousemove', moveHandler)
					.on('mouseleave', this.hideTooltip.bind(this, itemEl, item))
					.find('.icon')
					.on('contextmenu', this.showContext.bind(this, item));
			}
		},

		showContext: function (item, e) {
			events.emit('onContextMenu', [{
				text: 'withdraw',
				callback: this.withdraw.bind(this, item)
			}], e);

			e.preventDefault();
			return false;
		},

		hideTooltip: function () {
			events.emit('onHideItemTooltip', this.hoverItem);
			this.hoverItem = null;
		},
		
		onHover: function (el, item, e) {
			if (item)
				this.hoverItem = item;
			else
				item = this.hoverItem;

			let ttPos = null;

			if (el) {
				el.removeClass('new');
				delete item.isNew;

				let elOffset = el.offset();
				ttPos = {
					x: ~~(elOffset.left + 74),
					y: ~~(elOffset.top + 4)
				};
			}
		
			events.emit('onShowItemTooltip', item, ttPos, true);
		},

		onClick: function (el, item) {
			client.request({
				cpn: 'player',
				method: 'performAction',
				data: {
					cpn: 'equipment',
					method: 'equip',
					data: item.id
				}
			});
		},

		onGetStashItems: function (items) {
			this.items = items;

			if (this.shown)
				this.build();
		},

		onAddStashItems: function (addItems) {
			const { items } = this;

			addItems.forEach(newItem => {
				const existIndex = items.findIndex(i => i.id === newItem.id);
				if (existIndex !== -1)
					items.splice(existIndex, 1, newItem);
				else
					items.push(newItem);
			});
		},

		onRemoveStashItems: function (removeItemIds) {
			const { items } = this;

			removeItemIds.forEach(id => {
				const item = items.find(i => i.id === id);
				if (item === this.hoverItem) 
					this.hideTooltip();

				items.spliceWhere(i => i.id === id);
			});

			if (this.shown)
				this.build();
		},

		onAfterShow: function () {
			if ((!this.shown) && (!window.player.stash.active))
				return;

			events.emit('onShowOverlay', this.el);
			this.build();
		},

		beforeHide: function () {
			if ((!this.shown) && (!window.player.stash.active))
				return;

			events.emit('onHideOverlay', this.el);
			events.emit('onHideContextMenu');
		},

		onOpenStash: function ({ items, maxItems }) {
			this.maxItems = maxItems;

			this.show();

			this.onGetStashItems(items);
		},

		beforeDestroy: function () {
			events.emit('onHideOverlay', this.el);
		},

		withdraw: function (item) {
			if (!item)
				return;

			client.request({
				cpn: 'player',
				method: 'performAction',
				data: {
					cpn: 'stash',
					method: 'withdraw',
					data: {
						itemId: item.id
					}
				}
			});
		},

		onKeyDown: function (key) {
			if (key === 'shift' && this.hoverItem)
				this.onHover();
			else if (key === 'esc' && this.shown)
				this.toggle();
		},

		onKeyUp: function (key) {
			if (key === 'shift' && this.hoverItem)
				this.onHover();
		}
	};
});
