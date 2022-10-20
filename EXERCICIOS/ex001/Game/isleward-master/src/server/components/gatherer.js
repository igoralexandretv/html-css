let qualityGenerator = require('../items/generators/quality');

module.exports = {
	type: 'gatherer',

	nodes: [],
	gathering: null,
	gatheringTtl: 0,
	gatheringTtlMax: 7,
	defaultTtlMax: 7,

	simplify: function () {
		return {
			type: 'gatherer'
		};
	},

	gather: function () {
		const { gathering, nodes, defaultTtlMax, obj } = this;
		const { equipment, stats, instance: { eventEmitter } } = obj;

		if (gathering)
			return;
		else if (!nodes.length)
			return;

		const [ node ] = nodes;

		if (!this.hasSpace(node)) {
			this.sendAnnouncement('Your bags are too full to gather any more resources.');
			return;
		}

		const eGather = {
			node,
			obj: this
		};
		eventEmitter.emit('beforeGatherResource', eGather);
		obj.fireEvent('beforeGatherResource', eGather);

		this.gathering = node;

		let ttlMax = node.resourceNode.ttl || defaultTtlMax;

		if (node.resourceNode.nodeType === 'fish') {
			if (equipment.isSlotEmpty('tool')) {
				this.sendAnnouncement('You need a fishing rod to fish');
				this.gathering = null;

				return;
			}

			let statCatchSpeed = Math.min(150, stats.values.catchSpeed);
			ttlMax *= (1 - (statCatchSpeed / 200));
		}

		this.gatheringTtlMax = ttlMax;
		this.gatheringTtl = ttlMax;
	},

	update: function () {
		let gathering = this.gathering;

		if (!gathering)
			return;

		let isFish = (gathering.resourceNode.nodeType === 'fish');
		let hasSpace = this.hasSpace(this.gathering);

		if (gathering.destroyed || !hasSpace) {
			this.gathering = null;
			this.gatheringTtl = 0;
			this.obj.syncer.set(false, 'gatherer', 'progress', 100);
			this.obj.syncer.set(true, 'gatherer', 'progress', 100);
			if (isFish)
				this.obj.syncer.set(true, 'gatherer', 'action', 'Fishing');
			if (!hasSpace)
				this.sendAnnouncement('Your bags are too full to gather any more resources.');
			return;
		}

		if (this.gatheringTtl > 0) {
			if (this.gatheringTtl === this.gatheringTtlMax && gathering.width > 1) {
				['x', 'y', 'width', 'height'].forEach(p => {
					this.obj.syncer.set(false, 'gatherer', p, gathering[p]);
				});
			}

			this.gatheringTtl--;

			let progress = 100 - ~~((this.gatheringTtl / this.gatheringTtlMax) * 100);
			this.obj.syncer.set(true, 'gatherer', 'progress', progress);
			if (isFish)
				this.obj.syncer.set(true, 'gatherer', 'action', 'Fishing');

			return;
		}

		this.completeGathering(gathering, isFish);
	},

	completeGathering: function (gathering, isFish) {
		let resourceNode = gathering.resourceNode;
		let gatherResult = extend({
			obj: gathering,
			source: this.obj
		}, {
			nodeType: resourceNode.nodeType,
			blueprint: resourceNode.blueprint,
			xp: resourceNode.xp,
			items: gathering.inventory.items
		});
		this.obj.instance.eventEmitter.emit('beforeGatherResourceComplete', gatherResult);
		this.obj.fireEvent('beforeGatherResourceComplete', gatherResult);

		this.obj.syncer.set(false, 'gatherer', 'progress', 100);

		if (isFish) {
			const catchChance = gatherResult.blueprint.gatherChance + this.obj.stats.values.catchChance;
			if (~~(Math.random() * 100) >= catchChance) {
				this.sendAnnouncement('The fish got away');
				this.gathering = null;

				return;
			}

			gatherResult.items.forEach(g => {
				if (g.slot)
					return;
				
				delete g.quantity;

				qualityGenerator.generate(g, {
					//100 x 2.86 = 2000 (chance for a common)
					bonusMagicFind: this.obj.stats.values.fishRarity * 2.82
				});

				g.name = {
					0: '',
					1: 'Big ',
					2: 'Giant ',
					3: 'Trophy ',
					4: 'Fabled '
				}[g.quality] + g.name;

				let statFishWeight = 1 + (this.obj.stats.values.fishWeight / 100);
				let weight = ~~((gatherResult.blueprint.baseWeight + g.quality + (Math.random() * statFishWeight)) * 100) / 100;
				g.stats = {
					weight: weight
				};

				g.worth = ~~(weight * 10);
			});
		} else {
			gatherResult.items.forEach(g => {
				if (g.worth === undefined)
					g.worth = 1;
			});
		}

		if (isFish) {
			let itemChance = 1 + this.obj.stats.values.fishItems;
			if (~~(Math.random() * 500) < itemChance) {
				gatherResult.items = [{
					name: 'Cerulean Pearl',
					material: true,
					quantity: 1,
					quality: 3,
					sprite: [11, 9]
				}];
			}
		}

		let blueprint = gatherResult.blueprint;

		gatherResult.items.forEach((item, i) => {
			delete item.pos;

			if (i === 0) {
				if (blueprint.itemName)
					item.name = blueprint.itemName;
				if (blueprint.itemAmount)
					item.quantity = ~~(Math.random() * blueprint.itemAmount[1]) + blueprint.itemAmount[0];
			}

			this.obj.inventory.getItem(item, false, false, true);

			if (item.material)
				this.obj.fireEvent('afterGatherResource', gatherResult);
		});

		if (!gatherResult.noChangeAmount)
			resourceNode.gather();

		this.obj.stats.getXp(gatherResult.xp, this.obj, gatherResult.obj);

		if (gathering.destroyed) {
			if (isFish)
				this.sendAnnouncement('The school has been depleted');

			this.nodes.spliceWhere(n => (n === gathering));
			this.updateServerActions(false);
		}

		this.gathering = null;
	},

	hasSpace: function (node) {
		// By default, the player is allowed to gather "nothing"
		if (!node.inventory || !node.inventory.items)
			return true;
		
		return this.obj.inventory.hasSpaceList(node.inventory.items);
	},

	enter: function (node) {
		const { obj } = this;

		let gatherResult = extend({
			nodeName: node.name
		});
		obj.instance.eventEmitter.emit('beforeEnterPool', gatherResult, obj);

		let nodeType = node.resourceNode.nodeType;

		if (nodeType === 'fish') {
			if (!obj.equipment.eq.has('tool')) {
				this.sendAnnouncement('You need a fishing rod to fish');

				return;
			}
		}

		this.updateServerActions(true);

		let action = null;
		if (nodeType === 'fish')
			action = 'fish for';
		else if (nodeType === 'herb')
			action = 'gather the';
		const actionString = `${action} ${gatherResult.nodeName}`;

		this.sendAnnouncement(`Press U to ${actionString}`);

		this.nodes.spliceWhere(n => (n === node));
		this.nodes.push(node);
	},

	exit: function (node) {
		if (!this.nodes.includes(node))
			return;

		this.updateServerActions(false);

		this.nodes.spliceWhere(n => (n === node));
	},

	sendAnnouncement: function (msg) {
		process.send({
			method: 'events',
			data: {
				onGetAnnouncement: [{
					obj: {
						msg: msg
					},
					to: [this.obj.serverId]
				}]
			}
		});
	},

	updateServerActions: function (isAdd) {
		const { obj } = this;

		const action = isAdd ? 'addActions' : 'removeActions';
		obj.syncer.setArray(true, 'serverActions', action, {
			key: 'u',
			action: {
				cpn: 'gatherer',
				method: 'gather',
				data: {
					targetId: obj.id
				}
			}
		});
	},

	events: {
		beforeRezone: function () {
			this.events.beforeMove.call(this);
		},

		beforeMove: function () {
			if (!this.gathering)
				return;

			['x', 'y', 'width', 'height'].forEach(p => {
				this.obj.syncer.delete(false, 'gatherer', p);
			});

			this.obj.syncer.set(true, 'gatherer', 'progress', 100);
			this.obj.syncer.set(false, 'gatherer', 'progress', 100);

			if (this.gathering.resourceNode.nodeType === 'fish')
				this.obj.syncer.set(true, 'gatherer', 'action', 'Fishing');

			this.gathering = null;
		},

		beforeCastSpell: function () {
			this.events.beforeMove.call(this);
		},

		beforeTakeDamage: function () {
			this.events.beforeMove.call(this);
		},

		afterEquipItem: function (item) {
			let nodes = this.nodes;
			let nLen = nodes.length;

			for (let i = 0; i < nLen; i++) {
				let node = nodes[i];
				if (item.slot !== 'tool')
					continue;

				if (node.resourceNode.nodeType === 'fish') {
					if (!this.obj.equipment.eq.has('tool')) {
						this.sendAnnouncement('You need a fishing rod to fish');

						if (this.gathering === node) {
							if (this.gathering.resourceNode.nodeType === 'fish')
								this.obj.syncer.set(true, 'gatherer', 'action', 'Fishing');

							this.gathering = null;
							this.obj.syncer.set(true, 'gatherer', 'progress', 100);
							this.obj.syncer.set(false, 'gatherer', 'progress', 100);
						}
					}
				}
			}
		},

		afterUnequipItem: function (item) {
			this.events.afterEquipItem.call(this, item);
		}
	}
};
