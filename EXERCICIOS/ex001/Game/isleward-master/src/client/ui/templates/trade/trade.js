define([
	'js/system/events',
	'js/system/client',
	'html!ui/templates/trade/template',
	'css!ui/templates/trade/styles',
	'html!ui/templates/inventory/templateItem',
	'ui/shared/renderItem'
], function (
	events,
	client,
	template,
	styles,
	tplItem,
	renderItem
) {
	return {
		tpl: template,

		centered: true,

		modal: true,
		hasClose: true,

		list: null,
		action: null,

		postRender: function () {
			this.onEvent('onGetTradeList', this.onGetTradeList.bind(this));
			this.onEvent('onCloseTrade', this.hide.bind(this));
		},

		onGetTradeList: function (itemList, action) {
			itemList = itemList || this.itemList;
			action = action || this.action;

			this.itemList = itemList;
			this.action = action;

			this.find('.heading-text').html(action);

			let uiInventory = $('.uiInventory').data('ui');

			let container = this.el.find('.grid')
				.empty();

			let buyItems = itemList.items;

			buyItems.forEach(item => {
				if ((item === this.hoverItem))
					this.onHover(null, item);
			});

			const itemsHavePositions = action === 'sell' || buyItems.find(b => b.pos);

			let iLen = Math.max(buyItems.length, 50);
			for (let i = 0; i < iLen; i++) {
				let item = buyItems[i];

				if (itemsHavePositions)
					item = buyItems.find(b => b.pos === i);

				if (!item) {
					renderItem(container, null)
						.on('click', uiInventory.hideTooltip.bind(uiInventory));

					continue;
				}

				item = $.extend(true, {}, item);

				let itemEl = renderItem(container, item);

				itemEl
					.data('item', item)
					.find('.icon')
					.addClass(item.type);

				if (isMobile)
					itemEl.on('click', this.onHover.bind(this, itemEl, item, action));
				else {
					itemEl
						.on('click', this.onClick.bind(this, itemEl, item, action))
						.on('mousemove', this.onHover.bind(this, itemEl, item, action))
						.on('mouseleave', uiInventory.hideTooltip.bind(uiInventory, itemEl, item));
				}

				if (action === 'buy') {
					let noAfford = false;
					if (item.worth.currency) {
						let currencyItems = window.player.inventory.items.find(f => f.name === item.worth.currency);
						noAfford = ((!currencyItems) || (currencyItems.quantity < item.worth.amount));
					} else
						noAfford = (~~(item.worth * this.itemList.markup) > window.player.trade.gold);

					if (!noAfford && item.factions)
						noAfford = item.factions.some(f => f.noEquip);

					if (noAfford)
						$('<div class="no-afford"></div>').appendTo(itemEl);
				}

				if (item.worth.currency)
					item.worthText = item.worth.amount + 'x ' + item.worth.currency;
				else
					item.worthText = ~~(itemList.markup * item.worth);
			}

			this.center();
			this.show();
			events.emit('onShowOverlay', this.el);
		},

		onClick: function (el, item, action, e) {
			el.addClass('disabled');

			client.request({
				cpn: 'player',
				method: 'performAction',
				data: {
					cpn: 'trade',
					method: 'buySell',
					data: {
						itemId: item.id,
						action: action
					}
				},
				callback: this.onServerRespond.bind(this, el)
			});

			events.emit('onBuySellItem', this.el);

			let uiInventory = $('.uiInventory').data('ui');
			uiInventory.hideTooltip(el, item, e);
		},

		onHover: function (el, item, action, e) {
			let uiInventory = $('.uiInventory').data('ui');
			uiInventory.onHover(el, item, e);

			let canAfford = true;
			if (action === 'buy') {
				if (item.worth.currency) {
					let currencyItems = window.player.inventory.items.find(i => i.name === item.worth.currency);
					canAfford = (currencyItems && currencyItems.quantity >= item.worth.amount);
				} else
					canAfford = (item.worth * this.itemList.markup <= window.player.trade.gold);
			}

			let uiTooltipItem = $('.uiTooltipItem').data('ui');
			uiTooltipItem.showWorth(canAfford);

			if (isMobile)
				uiTooltipItem.addButton(action, this.onClick.bind(this, el, item, action));
		},

		beforeHide: function () {
			events.emit('onHideOverlay', this.el);
			$('.uiInventory').data('ui').hideTooltip();
		},

		onServerRespond: function (el) {
			el.removeClass('disabled');
		}
	};
});
