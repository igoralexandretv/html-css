module.exports = {
	'thaumaturge yala': {
		1: {
			msg: [{
				msg: 'Yes?',
				options: [1.1, 1.2, 1.3, 1.4, 1.5, 1.6]
			}],
			options: {
				1.1: {
					msg: 'Who are you?',
					goto: '2'
				},
				1.2: {
					msg: 'Where did you come from?',
					goto: '5'
				},
				1.3: {
					msg: 'Do you have any items for sale?',
					goto: 'tradeBuy'
				},
				1.4: {
					msg: 'I have some items to sell.',
					goto: 'tradeSell'
				},
				1.5: {
					msg: 'I want to buy something back.',
					goto: 'tradeBuyback'
				},
				1.6: {
					msg: 'I have some crystals for you.',
					prereq: function (obj) {
						let crystals = obj.inventory.items.find(i => (i.name === 'Digested Crystal'));
						return !!crystals;
					},
					goto: 'giveCrystals'
				}
			}
		},
		2: {
			msg: [{
				msg: 'I am Thaumaturge Yala, thirty-fourth in line to the throne of the Akarei.',
				options: [2.1]
			}],
			options: {
				2.1: {
					msg: 'Who are the Akarei?',
					goto: '3'
				}
			}
		},
		3: {
			msg: [{
				msg: 'The Akarei are both the first, and the last wielders of true magic.',
				options: [3.1]
			}],
			options: {
				3.1: {
					msg: 'True magic?',
					goto: '4'
				}
			}
		},
		4: {
			msg: [{
				msg: 'Others toil away in an effort to bend magic to their wills; tainting it. We, the Akarei, perform only the purest of incantations.',
				options: [4.1]
			}],
			options: {
				4.1: {
					msg: 'I would like to ask something else.',
					goto: '1'
				}
			}
		},
		5: {
			msg: [{
				msg: 'We hail from the city Iskar; our home and haven.',
				options: [5.1, 5.2]
			}],
			options: {
				5.1: {
					msg: 'How did you get here?',
					goto: '6'
				},
				5.2: {
					msg: 'What are you doing here?',
					goto: '10'
				}
			}
		},
		6: {
			msg: [{
				msg: 'Through a portal, for Iskar lies in another dimension. But now, we are trapped here. The portal has been closed from the other side and we lack the power to repopen it from here.',
				options: [6.1]
			}],
			options: {
				6.1: {
					msg: 'Why would the portal have been closed?',
					goto: '7'
				}
			}
		},
		7: {
			msg: [{
				msg: 'I can not say for certain, but the Akarei have never been wanting for enemies.',
				options: [7.1]
			}],
			options: {
				7.1: {
					msg: 'A foe?',
					goto: '8'
				}
			}
		},
		8: {
			msg: [{
				msg: 'A darkness. A nameless, faceless enemy that we can neither identify, nor combat. It has been chipping away at our defenses...almost consuming them. I fear if we do not return soon, it will be too late.',
				options: [8.1]
			}],
			options: {
				8.1: {
					msg: 'How can I help?',
					goto: '9'
				}
			}
		},
		9: {
			msg: [{
				msg: 'Slay the snails, gather crystals and bring them to me. The Akarei may reward those who assist them.',
				options: [9.1]
			}],
			options: {
				9.1: {
					msg: 'I would like to ask something else.',
					goto: '1'
				}
			}
		},
		10: {
			msg: [{
				msg: 'We were sent here by the Iskar Council, to seek a new form of energy.',
				options: [10.1, 10.2]
			}],
			options: {
				10.1: {
					msg: 'How will the energy be used?',
					goto: '11'
				},
				10.2: {
					msg: 'And, did you find it?',
					goto: '12'
				}
			}
		},
		11: {
			msg: [{
				msg: 'Iskar is protected by a magic dome, created by the Founders; a bulwark of pure energy that has stood the test of all but our newest foe.',
				options: [7.1]
			}],
			options: {

			}
		},
		12: {
			msg: [{
				msg: 'In a manner. The crystals in this cave are highly energized but in their natural form, they are too unstable for use.',
				options: [12.1]
			}],
			options: {
				12.1: {
					msg: 'So, your mission failed?',
					goto: '13'
				}
			}
		},
		13: {
			msg: [{
				msg: 'Not so. Curiously, the snails that inhabit this cave seem to have quite a taste for the crystals\' unstable energy and once passed through their digestive tracts, it is expelled in a stable, usable form.',
				options: [13.1]
			}],
			options: {
				13.1: {
					msg: 'Well...that\'s disgusting.',
					goto: '14'
				}
			}
		},
		14: {
			msg: [{
				msg: 'Perhaps. But it may prove to be our salvation. For now we have double need of the energy. Our portal was closed from the other side and we don\'t have sufficient power between us to reopen it from here.',
				options: [14.1, 6.1]
			}],
			options: {
				14.1: {
					msg: 'How can I help?',
					goto: '9'
				}
			}
		},
		tradeBuy: {
			cpn: 'trade',
			method: 'startBuy',
			args: [{
				targetName: 'thaumaturge yala'
			}]
		},
		tradeSell: {
			cpn: 'trade',
			method: 'startSell',
			args: [{
				targetName: 'thaumaturge yala'
			}]
		},
		tradeBuyback: {
			cpn: 'trade',
			method: 'startBuyback',
			args: [{
				targetName: 'thaumaturge yala'
			}]
		},
		giveCrystals: {
			msg: [{
				msg: 'The Akarei thank you.',
				options: [1.1, 1.2, 1.3, 1.4, 1.5]
			}],
			method: function (obj) {
				let inventory = obj.inventory;

				let crystals = inventory.items.find(i => (i.name === 'Digested Crystal'));
				if (!crystals)
					return;
				obj.reputation.getReputation('akarei', (crystals.quantity || 1) * 15);

				inventory.destroyItem({ itemId: crystals.id });
			}
		}
	}
};
