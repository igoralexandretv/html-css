define([
	'js/input'
], function (
	input
) {
	const getCompareItem = msg => {
		const shiftDown = input.isKeyDown('shift', true);

		let item = msg.item;
		let items = window.player.inventory.items;

		let compare = null;
		if (item.slot) {
			compare = items.find(i => i.eq && i.slot === item.slot);

			// check special cases for mismatched weapon/offhand scenarios (only valid when comparing)
			if (!compare) {
				let equippedTwoHanded = items.find(i => i.eq && i.slot === 'twoHanded');
				let equippedOneHanded = items.find(i => i.eq && i.slot === 'oneHanded');
				let equippedOffhand = items.find(i => i.eq && i.slot === 'offHand');

				if (item.slot === 'twoHanded') {
					if (!equippedOneHanded) 
						compare = equippedOffhand;
					else if (!equippedOffhand) 
						compare = equippedOneHanded;
					else {
						// compare against oneHanded and offHand combined by creating a virtual item that is the sum of the two
						compare = $.extend(true, {}, equippedOneHanded);
						compare.refItem = equippedOneHanded;

						for (let s in equippedOffhand.stats) {
							if (!compare.stats[s])
								compare.stats[s] = 0;

							compare.stats[s] += equippedOffhand.stats[s];
						}

						if (!compare.implicitStats)
							compare.implicitStats = [];

						(equippedOffhand.implicitStats || []).forEach(s => {
							let f = compare.implicitStats.find(i => i.stat === s.stat);
							if (!f) {
								compare.implicitStats.push({
									stat: s.stat,
									value: s.value
								});
							} else
								f.value += s.value;
						});
					}
				}

				if (item.slot === 'oneHanded') 
					compare = equippedTwoHanded;

				// this case is kind of ugly, but we don't want to go in when comparing an offHand to (oneHanded + empty offHand) - that should just use the normal compare which is offHand to empty
				if (item.slot === 'offHand' && equippedTwoHanded && shiftDown) {
					// since we're comparing an offhand to an equipped Twohander, we need to clone the 'spell' values over (setting damage to zero) so that we can properly display how much damage
					// the player would lose by switching to the offhand (which would remove the twoHander)
					// keep a reference to the original item for use in onHideToolTip
					let spellClone = $.extend(true, {}, equippedTwoHanded.spell);
					spellClone.name = '';
					spellClone.values.damage = 0;

					let clone = $.extend(true, {}, item, {
						spell: spellClone
					});
					clone.refItem = item;
					msg.item = clone;

					compare = equippedTwoHanded;
				}
			}
		}

		msg.compare = compare;
	};

	return getCompareItem;
});
