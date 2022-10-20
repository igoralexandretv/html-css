define([
	'js/system/events'
], function (
	events
) {
	return {
		type: 'inventory',

		items: [],

		init: function (blueprint) {
			events.emit('onGetItems', this.items);
		},

		extend: function ({ destroyItems, getItems }) {
			const { items } = this;

			let rerenderNeeded = false;

			if (destroyItems) {
				rerenderNeeded = true;
				events.emit('onDestroyItems', destroyItems, this.items);
			}

			if (getItems) {
				getItems.forEach(g => {
					const findItem = items.find(i => i.id === g.id);

					if (!findItem) {
						rerenderNeeded = true;

						const clonedItem = $.extend({}, g);
						clonedItem.isNew = true;

						items.push(clonedItem);

						return;
					}

					if (!rerenderNeeded) {
						rerenderNeeded = (
							findItem.pos !== g.pos ||
							findItem.eq !== g.eq ||
							findItem.active !== g.active ||
							findItem.quickSlot !== g.quickSlot || 
							findItem.quantity !== g.quantity
						);
					}

					Object.getOwnPropertyNames(findItem).forEach(p => {
						delete findItem[p];
					});

					$.extend(findItem, g);
				});

				events.emit('onGetItems', this.items, rerenderNeeded, getItems);
			}
		},

		equipItemErrors: function (item) {
			let errors = [];
			let stats = this.obj.stats.values;

			if (item.level > stats.level)
				errors.push('level');

			if (item.requires && item.requires[0] && stats[item.requires[0].stat] < item.requires[0].value)
				errors.push('stats');

			if (item.factions) {
				if (item.factions.some(f => f.noEquip))
					errors.push('faction');
			}

			return errors;
		},

		canEquipItem: function (item) {
			return (this.equipItemErrors(item).length === 0);
		}
	};
});
