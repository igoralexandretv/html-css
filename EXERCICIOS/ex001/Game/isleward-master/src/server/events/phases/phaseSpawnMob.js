let mobBuilder = require('../../world/mobBuilder');

const buildMob = (objects, mobConfig, x, y, mobIndex) => {
	const { id, sheetName, cell, name, properties, originX, originY, maxChaseDistance, dialogue, trade, chats, events } = mobConfig;

	let mob = objects.buildObjects([{
		x: x,
		y: y,
		sheetName: sheetName || 'mobs',
		cell: cell,
		name: name,
		properties: properties
	}]);

	mobBuilder.build(mob, mobConfig);

	if (id)
		mob.id = id.split('$').join(mobIndex);

	if (originX) {
		mob.mob.originX = originX;
		mob.mob.originY = originY;
		mob.mob.goHome = true;
		mob.mob.maxChaseDistance = maxChaseDistance;
		//This is a hack to make mobs that run somewhere able to take damage
		delete mob.mob.events.beforeTakeDamage;
	}

	if (dialogue) {
		mob.addComponent('dialogue', {
			config: dialogue.config
		});

		if (dialogue.auto) {
			mob.dialogue.trigger = objects.buildObjects([{
				properties: {
					x: mob.x - 1,
					y: mob.y - 1,
					width: 3,
					height: 3,
					cpnNotice: {
						actions: {
							enter: {
								cpn: 'dialogue',
								method: 'talk',
								args: [{
									targetName: mob.name.toLowerCase()
								}]
							},
							exit: {
								cpn: 'dialogue',
								method: 'stopTalk'
							}
						}
					}
				}
			}]);
		}
	}

	if (trade)
		mob.addComponent('trade', trade);

	if (chats)
		mob.addComponent('chatter', chats);

	if (events) {
		mob.addBuiltComponent({
			type: 'eventComponent',
			events: events
		});
	}

	if (mobConfig.needLos !== undefined)
		mob.mob.needLos = mobConfig.needLos;

	if (mobConfig.spawnHpPercent) 
		mob.stats.values.hp = (mob.stats.values.hpMax * mobConfig.spawnHpPercent);

	return mob;
};

const spawnAnimation = (syncer, { x, y }) => {
	syncer.queue('onGetObject', {
		x: x,
		y: y,
		components: [{
			type: 'attackAnimation',
			row: 0,
			col: 4
		}]
	}, -1);
};

module.exports = {
	spawnRect: null,
	mobs: null,

	init: function () {
		const { spawnRect, instance: { objects, syncer } } = this;

		if (!this.mobs.push)
			this.mobs = [this.mobs];

		let usedSpots = ['-1,-1'];

		this.mobs.forEach(function (l) {
			let amount = l.amount || 1;
			delete l.amount;

			l.walkDistance = 0;

			for (let i = 0; i < amount; i++) {
				let x = -1;
				let y = -1;

				let pos = l.pos;
				if (pos) {
					if (typeof(pos) === 'function')
						pos = pos(i);

					if (pos instanceof Array) {
						x = pos[i].x;
						y = pos[i].y;
					} else {
						x = pos.x;
						y = pos.y;
					}

					if (spawnRect) {
						x += spawnRect.x;
						y += spawnRect.y;
					}
				} else {
					while (usedSpots.indexOf(x + ',' + y) > -1) {
						x = spawnRect.x + ~~(Math.random() * spawnRect.w);
						y = spawnRect.y + ~~(Math.random() * spawnRect.h);
					}

					usedSpots.push(x + ',' + y);
				}

				if (l.exists) {
					let mob = objects.objects.find(o => (o.name === l.name));

					mob.mob.walkDistance = 0;
					spawnAnimation(syncer, mob);
					mob.performMove({
						force: true,
						data: {
							x: x,
							y: y
						}
					});
					spawnAnimation(syncer, mob);
					this.event.objects.push(mob);
				} else {
					const mob = buildMob(objects, l, x, y, i);
					this.event.objects.push(mob);
					mob.event = this.event;
					spawnAnimation(syncer, mob);
				}
			}
		}, this);

		if (!this.endMark)
			this.end = true;
	}
};
