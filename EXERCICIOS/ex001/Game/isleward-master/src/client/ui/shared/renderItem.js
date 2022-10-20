const tplItem = `
	<div class="renderItem item">
		<div class="icon"></div>
		<div class="quantity"></div>
	</div>
`;

define([
	'js/system/events',
	'js/system/globals'
], function (
	events,
	globals
) {
	const hideTooltip = (el, item, e) => {
		events.emit('onHideItemTooltip', item);
	};

	const renderItemManager = {
		hoverItem: null,

		onHover: function (el, item, e) {
			if (item)
				this.hoverItem = item;
			else
				item = this.hoverItem;

			let ttPos = null;

			if (el) {
				ttPos = {
					x: ~~(e.clientX + 32),
					y: ~~(e.clientY)
				};
			}

			events.emit('onShowItemTooltip', item, ttPos, true);
		},

		onKeyDown: function (key) {
			if (key === 'shift' && this.hoverItem)
				this.onHover();
		},

		onKeyUp: function (key) {
			if (key === 'shift' && this.hoverItem)
				this.onHover();
		},

		onMouseLeave: function (el, item, e) {
			if (this.hoverItem !== item)
				return;

			hideTooltip(el, item, e);

			this.hoverItem = null;
		}
	};

	events.on('onKeyDown', renderItemManager.onKeyDown.bind(renderItemManager));
	events.on('onKeyUp', renderItemManager.onKeyUp.bind(renderItemManager));

	const addTooltipEvents = (el, item) => {
		const leaveHandler = renderItemManager.onMouseLeave.bind(renderItemManager, el, item);
		let moveHandler = renderItemManager.onHover.bind(renderItemManager, el, item);
		let downHandler = () => {};
		if (isMobile) {
			moveHandler = () => {};
			downHandler = renderItemManager.onHover.bind(renderItemManager, el, item);
		}

		$.event.special.destroyed = {
			remove: function (o) {
				if (o.handler) 
					o.handler();
			}
		};

		el
			.on('mousedown', downHandler)
			.on('mousemove', moveHandler)
			.on('mouseleave', leaveHandler)
			.on('destroyed', leaveHandler);
	};

	const onShowContext = (item, getItemContextConfig, e) => {
		if (isMobile)
			hideTooltip(null, item);

		const contextConfig = getItemContextConfig(item);
		if (!contextConfig.length)
			return;

		events.emit('onContextMenu', contextConfig, e);

		e.preventDefault();
		return false;
	};

	const addContextEvents = (el, item, getItemContextConfig) => {
		el.on('contextmenu', onShowContext.bind(this, item, getItemContextConfig));
	};

	return (container, item, useEl, manageTooltip, getItemContextConfig, showNewIndicators = true) => {
		const { clientConfig: { spriteSizes } } = globals;

		const itemEl = useEl || $(tplItem).appendTo(container);

		if (!item) {
			itemEl.addClass('empty');

			return itemEl;
		}

		let spritesheet = item.spritesheet || '../../../images/items.png';
		if (!item.spritesheet) {
			if (item.material)
				spritesheet = '../../../images/materials.png';
			else if (item.quest)
				spritesheet = '../../../images/questItems.png';
			else if (item.type === 'consumable')
				spritesheet = '../../../images/consumables.png';
			else if (item.type === 'skin')
				spritesheet = '../../../images/characters.png';
		}

		let size = 64;

		if (item.type === 'skin')
			size = 8;

		if (item.spriteSize)
			size = item.spriteSize;

		if (spriteSizes[spritesheet])
			size = spriteSizes[spritesheet];

		const imgX = (-item.sprite[0] * size);
		const imgY = (-item.sprite[1] * size);
		const backgroundPosition = `${imgX}px ${imgY}px`;

		itemEl
			.find('.icon')
			.css({
				background: `url(${spritesheet}) no-repeat scroll ${backgroundPosition} / auto`,
				width: `${size}px`,
				height: `${size}px`
			});

		if (item.quantity > 1 || item.eq || item.active || item.has('quickSlot')) {
			let elQuantity = itemEl.find('.quantity');
			let txtQuantity = item.quantity;
			if (!txtQuantity)
				txtQuantity = item.has('quickSlot') ? 'QS' : 'EQ';

			elQuantity.html(txtQuantity);

			//If the item doesn't have a quantity and we reach this point
			//it must mean that it's active, EQd or QSd
			if (!item.quantity)
				itemEl.addClass('eq');
		} else if (item.isNew && showNewIndicators) {
			itemEl.addClass('new');
			itemEl.find('.quantity').html('NEW');
		}

		if (item.slot) {
			const equipErrors = window.player.inventory.equipItemErrors(item);
			if (equipErrors.length)
				itemEl.addClass('no-equip');
		}

		if (item.has('quality'))
			itemEl.addClass(`quality-${item.quality}`);

		if (manageTooltip)
			addTooltipEvents(itemEl, item);

		if (getItemContextConfig)
			addContextEvents(itemEl, item, getItemContextConfig);

		itemEl.addClass(`spriteSize${size}`);

		return itemEl;
	};
});
