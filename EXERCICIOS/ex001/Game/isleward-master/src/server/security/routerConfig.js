let events = require('../misc/events');

const routerConfig = {
	signatures: {
		global: {
			clientConfig: {
				getClientConfig: {
					callback: true,
					data: []
				}
			},
			leaderboard: {
				requestList: {
					callback: true,
					data: [
						{
							key: 'offset',
							dataType: 'integer'
						},
						{
							key: 'prophecies',
							dataType: 'arrayOfStrings'
						}
					]
				}
			},
			cons: {
				unzone: {
					callback: true,
					data: []
				}
			}
		},
		threadGlobal: {
			instancer: {
				clientAck: {
					callback: false,
					data: []
				}
			},
			rezoneManager: {
				clientAck: {
					callback: false,
					data: []
				}
			}
		},
		cpnMethods: {
			auth: {
				login: {
					callback: true,
					allowWhenIngame: false,
					data: [
						{
							key: 'username',
							dataType: 'string'
						},
						{
							key: 'password',
							dataType: 'string'
						}
					]
				},
				register: {
					callback: true,
					allowWhenIngame: false,
					data: [
						{
							key: 'username',
							dataType: 'string'
						},
						{
							key: 'password',
							dataType: 'string'
						}
					]
				},
				deleteCharacter: {
					callback: true,
					allowWhenIngame: false,
					data: [
						{
							key: 'name',
							dataType: 'string'
						}
					]
				},
				getSkinList: {
					callback: true,
					data: []
				},
				createCharacter: {
					callback: true,
					allowWhenIngame: false,
					data: [
						{
							key: 'name',
							dataType: 'string'
						},
						{
							key: 'class',
							dataType: 'string'
						},
						{
							key: 'skinId',
							dataType: 'string'
						},
						{
							key: 'prophecies',
							dataType: 'arrayOfStrings'
						}
					]
				},
				getCharacterList: {
					callback: true,
					allowWhenIngame: false,
					data: []
				},
				getCharacter: {
					callback: true,
					allowWhenIngame: false,
					data: [
						{
							key: 'name',
							dataType: 'string'
						}
					]
				},
				play: {
					callback: true,
					allowWhenIngame: false,
					data: [
						{
							key: 'name',
							dataType: 'string'
						}
					]
				}
			},
			player: {
				move: {
					callback: false,
					data: [
						{
							key: 'x',
							dataType: 'integer'
						},
						{
							key: 'y',
							dataType: 'integer'
						},
						{
							key: 'priority',
							dataType: 'boolean',
							optional: true
						}
					]
				},
				castSpell: {
					callback: false,
					data: [
						{
							key: 'priority',
							dataType: 'boolean'
						},
						{
							key: 'target',
							dataType: 'integerNullObjectOrString',
							spec: [
								{
									key: 'x',
									dataType: 'integer'
								},
								{
									key: 'y',
									dataType: 'integer'
								}
							]
						},
						{
							key: 'spell',
							dataType: 'integer'
						},
						{
							key: 'self',
							dataType: 'boolean',
							optional: true
						}
					]
				},
				performAction: {
					callback: 'deferred',
					data: [
						{
							key: 'cpn',
							dataType: 'string'
						},
						{
							key: 'method',
							dataType: 'string'
						},
						{
							key: 'data',
							dataType: 'object'
						}
					]
				}
			},
			social: {
				chat: {
					callback: false,
					data: [
						{
							key: 'message',
							dataType: 'string'
						},
						{
							key: 'type',
							dataType: 'string',
							optional: true
						},
						{
							key: 'subType',
							dataType: 'stringOrNull',
							optional: true
						},
						{
							key: 'item',
							dataType: 'object',
							optional: true
						}
					]
				},
				getInvite: {
					callback: false,
					data: [
						{
							key: 'targetId',
							dataType: 'integer'
						}
					]
				},
				acceptInvite: {
					callback: false,
					data: [
						{
							key: 'targetId',
							dataType: 'integer'
						}
					]
				},
				declineInvite: {
					callback: false,
					data: [
						{
							key: 'targetId',
							dataType: 'integer'
						}
					]
				},
				removeFromParty: {
					callback: false,
					data: [
						{
							key: 'id',
							dataType: 'integer'
						}
					]
				},
				leaveParty: {
					callback: false,
					data: []
				}

			}
		},
		threadCpnMethods: {
			dialogue: {
				talk: {
					callback: false,
					data: [
						{
							key: 'target',
							dataType: 'integerOrString'
						},
						{
							optional: true,
							key: 'state',
							dataType: 'numberOrString'
						}
					]
				}
			},
			gatherer: {
				gather: {
					callback: false,
					data: [
						{
							key: 'targetId',
							dataType: 'integer'
						}
					]
				}
			},
			quests: {
				complete: {
					callback: false,
					data: [
						{
							key: 'questId',
							dataType: 'integer'
						}
					]
				}
			},
			player: {
				clearQueue: {
					callback: false,
					data: []
				}
			},
			inventory: {
				combineStacks: {
					callback: false,
					data: [
						{
							key: 'fromId',
							dataType: 'integer'
						},
						{
							key: 'toId',
							dataType: 'integer'
						}
					]
				},
				splitStack: {
					callback: false,
					data: [
						{
							key: 'itemId',
							dataType: 'integer'
						},
						{
							key: 'stackSize',
							dataType: 'integer'
						}
					]
				},
				useItem: {
					callback: false,
					data: [
						{
							key: 'itemId',
							dataType: 'integer'
						}
					]
				},
				moveItem: {
					callback: false,
					data: [
						{
							key: 'moveMsgs',
							dataType: 'arrayOfObjects',
							spec: [
								{
									key: 'itemId',
									dataType: 'integer'
								},
								{
									key: 'targetPos',
									dataType: 'integer'
								}
							]
						}
					]
				},
				learnAbility: {
					callback: false,
					data: [
						{
							key: 'itemId',
							dataType: 'integer'
						},
						{
							key: 'slot',
							dataType: 'integer',
							optional: true
						}
					]
				},
				unlearnAbility: {
					callback: false,
					data: [
						{
							key: 'itemId',
							dataType: 'integer'
						}
					]
				},
				dropItem: {
					callback: false,
					data: [
						{
							key: 'itemId',
							dataType: 'integer'
						}
					]
				},
				destroyItem: {
					callback: false,
					data: [
						{
							key: 'itemId',
							dataType: 'integer'
						}
					]
				},
				salvageItem: {
					callback: false,
					data: [
						{
							key: 'itemId',
							dataType: 'integer'
						}
					]
				},
				stashItem: {
					callback: false,
					data: [
						{
							key: 'itemId',
							dataType: 'integer'
						}
					]
				},
				sortInventory: {
					callback: false,
					data: []
				}
			},
			equipment: {
				equip: {
					callback: false,
					data: [
						{
							key: 'itemId',
							dataType: 'integer'
						},
						{
							key: 'slot',
							dataType: 'string',
							optional: true
						}
					]
				},
				unequip: {
					callback: false,
					data: [
						{
							key: 'itemId',
							dataType: 'integer'
						},
						{
							key: 'slot',
							dataType: 'string',
							optional: true
						}
					]
				},
				setQuickSlot: {
					data: [
						{
							key: 'itemId',
							dataType: 'integer'
						},
						{
							key: 'slot',
							dataType: 'integer'
						}
					]
				},
				useQuickSlot: {
					data: [
						{
							key: 'slot',
							dataType: 'integer'
						}
					]
				},
				inspect: {
					callback: false,
					data: [
						{
							key: 'playerId',
							dataType: 'integer'
						}
					]
				}
			},
			stash: {
				withdraw: {
					callback: false,
					data: [
						{
							key: 'itemId',
							dataType: 'integer'
						}
					]
				},
				open: {
					callback: false,
					data: [
						{
							key: 'targetId',
							dataType: 'integer'
						}
					]
				}
			},
			trade: {
				buySell: {
					callback: false,
					data: [
						{
							key: 'itemId',
							dataType: 'integer'
						},
						{
							key: 'action',
							dataType: 'string'
						}
					]
				}
			},
			door: {
				lock: {
					callback: false,
					data: [
						{
							key: 'targetId',
							dataType: 'integer'
						}
					]
				},
				unlock: {
					callback: false,
					data: [
						{
							key: 'targetId',
							dataType: 'integer'
						}
					]
				}
			},
			wardrobe: {
				open: {
					callback: false,
					data: [
						{
							key: 'targetId',
							dataType: 'integer'
						}
					]
				},
				apply: {
					callback: false,
					data: [
						{
							key: 'targetId',
							dataType: 'integer'
						},
						{
							key: 'skinId',
							dataType: 'string'
						}
					]
				}
			},
			stats: {
				respawn: {
					callback: false,
					data: []
				}
			},
			passives: {
				tickNode: {
					callback: false,
					data: [
						{
							key: 'nodeId',
							dataType: 'integer'
						}
					]
				},
				untickNode: {
					callback: false,
					data: [
						{
							key: 'nodeId',
							dataType: 'integer',
							optional: true
						}
					]
				}
			},
			workbench: {
				open: {
					callback: false,
					data: [
						{
							key: 'targetId',
							dataType: 'integer'
						}
					]
				},
				craft: {
					callback: false,
					data: [
						{
							key: 'targetId',
							dataType: 'integer'
						},
						{
							key: 'name',
							dataType: 'string'
						},
						{
							key: 'pickedItemIds',
							dataType: 'arrayOfIntegers'
						}
					]
				},
				getRecipe: {
					data: [
						{
							key: 'targetId',
							dataType: 'integer'
						},
						{
							key: 'name',
							dataType: 'string'
						},
						{
							key: 'pickedItemIds',
							dataType: 'arrayOfIntegers',
							optional: true
						}
					]
				}
			}
		}
	}
};

module.exports = {
	routerConfig,

	init: function () {
		routerConfig.allowed = {};
		routerConfig.allowTargetId = {};
		routerConfig.secondaryAllowed = {};
		routerConfig.secondaryAllowTargetId = {};
		routerConfig.globalAllowed = {};

		events.emit('onBeforeGetRouterSignatureConfig', routerConfig);
	}
};
