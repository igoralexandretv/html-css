define([
	'js/system/events',
	'js/system/client',
	'html!ui/templates/workbench/template',
	'css!ui/templates/workbench/styles',
	'ui/shared/renderItem',
	'js/misc/statTranslations'
], function (
	events,
	client,
	template,
	styles,
	renderItem,
	statTranslations
) {
	return {
		tpl: template,

		centered: true,

		modal: true,
		hasClose: true,

		workbenchId: null,

		recipes: null,
		currentRecipe: null,

		selectedNeedItems: null,

		hoverItem: null,
		hoverEl: null,

		postRender: function () {
			this.onEvent('onOpenWorkbench', this.onOpenWorkbench.bind(this));
			this.onEvent('onCloseWorkbench', this.hide.bind(this));
			this.onEvent('onGetItems', this.onGetItems.bind(this));

			this.onEvent('onKeyDown', this.onKeyDown.bind(this));
			this.onEvent('onKeyUp', this.onKeyUp.bind(this));

			this.on('.btnCraft', 'click', this.craft.bind(this));
			this.on('.btnCancel', 'click', this.hide.bind(this));
		},

		onOpenWorkbench: function (msg) {
			this.workbenchId = msg.workbenchId;
			this.find('.mainHeading').html(msg.name);
			this.find('.itemPicker').hide();
			this.find('.needItems').hide();

			this.renderRecipes(msg.recipes);

			this.show();
		},

		//Redraw items if they change
		onGetItems: function (items) {
			if (!this.currentRecipe)
				return;

			const { currentRecipe: { needItems } } = this;
			
			this.buildNeedItemBoxes(needItems, true);
		},

		renderRecipes: function (recipes) {
			this.recipes = recipes;

			let container = this.find('.left .list').empty();

			recipes.forEach(function (r) {
				let el = $('<div class="item">' + r + '</div>')
					.appendTo(container);

				el.on('click', this.onSelectRecipe.bind(this, el, r));
				el.on('click', events.emit.bind(events, 'onClickListItem'));
			}, this);
		},

		onSelectRecipe: function (el, recipeName) {
			el.parent().find('.selected').removeClass('selected');
			el.addClass('selected');

			client.request({
				cpn: 'player',
				method: 'performAction',
				data: {
					cpn: 'workbench',
					method: 'getRecipe',
					data: {
						targetId: this.workbenchId,
						name: recipeName
					}
				},
				callback: this.onGetRecipe.bind(this, false)
			});
		},

		onGetRecipe: function (persistNeedItems, recipe) {
			const { name: recipeName, description, materials, needItems } = recipe;

			this.currentRecipe = recipe;

			this.find('.info .title').html(recipeName);
			this.find('.description').html(description);

			this.find('.materialList .material').remove();

			let container = this.find('.materialList')
				.css({
					visibility: 'visible'
				});

			let canCraft = !!materials.length;

			materials.forEach(m => {
				const { needQuantity, nameLike, name: materialName, haveQuantity, noHaveEnough } = m;

				const materialText = `${needQuantity}x ${(nameLike || materialName)} (${haveQuantity})`;
				let el = $(`<div class="material">${materialText}</div>`)
					.appendTo(container);

				if (noHaveEnough) {
					canCraft = false;
					el.addClass('need');
				}
			});

			this.find('.btnCraft')
				.removeClass('disabled');

			if (!canCraft) {
				this.find('.btnCraft')
					.addClass('disabled');
			}

			//If there are no materials, the selected items aren't valid
			this.find('.materialList').show();
			if (!materials.length) {
				this.find('.materialList').hide();
				persistNeedItems = false;
			}

			this.buildNeedItemBoxes(needItems, persistNeedItems);
		},

		buildNeedItemBoxes: function (needItems = [], persistNeedItems) {
			if (!persistNeedItems) {
				this.selectedNeedItems = new Array(needItems.length);
				this.selectedNeedItems.fill(null);
			}

			const container = this.find('.needItems').hide();
			const list = container.find('.list').empty();
			if (!needItems.length)
				return;

			container.css({ display: 'flex' });

			needItems.forEach((n, i) => this.buildNeedItemBox(list, n, i));
		},

		buildNeedItemBox: function (container, needItem, needItemIndex) {
			const item = this.selectedNeedItems[needItemIndex];
			const el = renderItem(container, item);

			el
				.on('mousemove', this.toggleTooltip.bind(this, true, el, needItem, item))
				.on('mouseleave', this.toggleTooltip.bind(this, false, el, needItem, item))
				.on('click', this.toggleItemPicker.bind(this, true, needItem, needItemIndex));
		},

		toggleItemPicker: function (show, needItem, needItemIndex) {
			const container = this.find('.itemPicker').hide();
			if (!show)
				return;

			const { allowedItemIds } = needItem;

			container
				.css({ display: 'flex' })
				.find('.heading-text').html(needItem.info);

			const list = container.find('.list').empty();

			const items = window.player.inventory.items
				.filter(item => {
					const isValidItem = allowedItemIds.some(f => f === item.id);

					return isValidItem;
				});

			items.forEach(item => {
				const el = renderItem(list, item);

				el
					.on('click', this.onSelectItem.bind(this, item, needItemIndex))
					.on('mousemove', this.toggleTooltip.bind(this, true, el, null, item))
					.on('mouseleave', this.toggleTooltip.bind(this, false, el, null, item));
			});
		},

		onSelectItem: function (item, needItemIndex) {
			this.selectedNeedItems[needItemIndex] = item;

			const { currentRecipe: { needItems } } = this;
			this.buildNeedItemBoxes(needItems, true);

			const allItemsSelected = this.selectedNeedItems.every(i => !!i);
			if (allItemsSelected && this.currentRecipe.dynamicMaterials) {
				const pickedItemIds = this.selectedNeedItems.map(i => i.id);

				client.request({
					cpn: 'player',
					method: 'performAction',
					data: {
						cpn: 'workbench',
						method: 'getRecipe',
						data: {
							targetId: this.workbenchId,
							name: this.currentRecipe.name,
							pickedItemIds
						}
					},
					callback: this.onGetRecipe.bind(this, true)
				});
			}

			this.find('.itemPicker').hide();
		},

		toggleTooltip: function (show, el, needItem, item, e) {
			if (item) {
				this.hoverItem = show ? item : null;
				this.hoverEl = show ? el : null;
			}

			let pos = null;
			if (e) {
				const { clientX, clientY } = e;
				
				pos = {
					x: clientX + 25,
					y: clientY
				};
			}

			if (item) {
				if (show)
					events.emit('onShowItemTooltip', item, pos, true);
				else
					events.emit('onHideItemTooltip', item);

				return;
			}

			if (show)
				events.emit('onShowTooltip', needItem.info, el[0], pos);
			else
				events.emit('onHideTooltip', el[0]);
		},

		craft: function () {
			const selectedRecipe = this.find('.left .list .item.selected').html();

			const pickedItemIds = this.selectedNeedItems
				.map(item => item.id);

			client.request({
				cpn: 'player',
				method: 'performAction',
				data: {
					cpn: 'workbench',
					method: 'craft',
					data: {
						targetId: this.workbenchId,
						name: selectedRecipe,
						pickedItemIds
					}
				},
				callback: this.onCraft.bind(this)
			});
		},

		onCraft: function ({ recipe, resultMsg }) {
			this.onGetRecipe(true, recipe);
		
			if (resultMsg) {
				const { msg: baseMsg, addStatMsgs = [] } = resultMsg;

				let msg = baseMsg; 

				addStatMsgs.forEach(a => {
					const statName = statTranslations.translate(a.stat);
					msg += `<br />${(a.value > 0) ? '+' : ''}${a.value} ${statName}`;
				});

				events.emit('onGetAnnouncement', {
					msg,
					top: 150
				});
			}
		},

		onAfterShow: function () {
			this.clear();
		},

		clear: function () {
			this.find('.left .list .selected').removeClass('selected');
			this.find('.info .title').html('');
			this.find('.description').html('');
			this.find('.materialList .material').remove();
			this.find('.materialList')
				.css({
					visibility: 'hidden'
				});
			this.find('.btnCraft').addClass('disabled');
		},

		onKeyDown: function (key) {
			if (key === 'shift' && this.hoverItem)
				this.toggleTooltip(true, this.hoverEl, null, this.hoverItem);
		},
		
		onKeyUp: function (key) {
			if (key === 'shift' && this.hoverItem)
				this.toggleTooltip(true, this.hoverEl, null, this.hoverItem);
		}
	};
});
