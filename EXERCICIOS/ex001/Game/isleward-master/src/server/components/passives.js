let passiveTree = require('../config/passiveTree');

module.exports = {
	type: 'passives',

	selected: [],
	points: 0,

	init: function (blueprint) {
		this.selected = ((blueprint || {}).selected || []);
		this.selected.spliceWhere(s => (passiveTree.nodes.some(n => ((n.id === s) && (n.spiritStart)))));

		this.selected.push(passiveTree.nodes.find(n => (n.spiritStart === this.obj.class)).id);

		let points = this.calcPoints();

		if (points + this.selected.length < this.selected.length) {
			this.selected = [];
			this.selected.push(passiveTree.nodes.find(n => (n.spiritStart === this.obj.class)).id);
			blueprint.selected = this.selected;
			points = this.calcPoints();
		}

		this.points = points;
		blueprint.points = points;

		let stats = this.obj.stats;

		this.selected.forEach(function (id) {
			let node = passiveTree.nodes.find(n => (n.id === id));
			if (node) {
				for (let p in node.stats) 
					stats.addStat(p, node.stats[p]);
			}
		});

		this.obj.spellbook.calcDps();
	},

	calcPoints: function () {
		let level = this.obj.stats.values.level;
		let points = level - this.selected.length + 1;

		if (level < consts.maxLevel)
			points--;

		return points;
	},

	tickNode: function (msg) {
		if (this.points <= 0)
			return;
		else if (this.selected.some(s => (s === msg.nodeId)))
			return;

		let nodeId = msg.nodeId;
		let node = passiveTree.nodes.find(n => (n.id === nodeId));

		if (!node || node.spiritStart)
			return;

		let linked = passiveTree.links.some(function (l) {
			if ((l.from !== node.id) && (l.to !== node.id))
				return false;

			return (
				(this.selected.indexOf(l.from) > -1) ||
				(this.selected.indexOf(l.to) > -1)
			);
		}, this);
		if (!linked)
			return;
		
		let passiveResult = {
			success: true
		};
		this.obj.fireEvent('onBeforePassivesChange', passiveResult, node);
		if (!passiveResult.success)
			return;
		this.obj.instance.eventEmitter.emit('onBeforePlayerPassivesChange', passiveResult, this.obj, node);
		if (!passiveResult.success)
			return;

		this.points--;
		this.obj.syncer.set(true, 'passives', 'points', this.points);

		this.selected.push(nodeId);
		this.obj.syncer.setArray(true, 'passives', 'tickNodes', nodeId);

		let stats = this.obj.stats;
		if (node) {
			for (let p in node.stats) 
				stats.addStat(p, node.stats[p]);
		}

		this.obj.spellbook.calcDps();
	},

	untickNode: function (msg) {
		let passiveResult = {
			success: true
		};
		this.obj.fireEvent('onBeforePassivesChange', passiveResult);
		if (!passiveResult.success)
			return;
		this.obj.instance.eventEmitter.emit('onBeforePlayerPassivesChange', passiveResult, this.obj);
		if (!passiveResult.success)
			return;

		let stats = this.obj.stats;

		this.selected.forEach(function (s) {
			let node = passiveTree.nodes.find(n => (n.id === s));
			if (node.spiritStart)
				return;

			this.points++;
			this.obj.syncer.set(true, 'passives', 'points', this.points);

			this.obj.syncer.setArray(true, 'passives', 'untickNodes', node.id);

			if (node) {
				for (let p in node.stats) 
					stats.addStat(p, -node.stats[p]);
			}
		}, this);

		this.selected = [];
		this.selected.push(passiveTree.nodes.find(n => (n.spiritStart === this.obj.class)).id);

		this.obj.spellbook.calcDps();
		this.obj.equipment.unequipAttrRqrGear();
	},

	simplify: function (self) {
		if (!self)
			return;

		return {
			type: 'passives',
			selected: this.selected,
			points: this.points
		};
	},

	events: {
		onLevelUp: function (level) {
			this.points = this.calcPoints();
			this.obj.syncer.set(true, 'passives', 'points', this.points);
		}
	}
};
