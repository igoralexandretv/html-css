let abs = Math.abs.bind(Math);
let rnd = Math.random.bind(Math);
let max = Math.max.bind(Math);

const canPathHome = require('./mob/canPathHome');

const teleportHome = (physics, obj, mob) => {
	physics.removeObject(obj, obj.x, obj.y);
	obj.x = mob.originX;
	obj.y = mob.originY;
	const syncer = obj.syncer;
	syncer.o.x = obj.x;
	syncer.o.y = obj.y;
	physics.addObject(obj, obj.x, obj.y);
	obj.aggro.clearIgnoreList();
	obj.aggro.move();
};

const performPatrolAction = ({ obj }, node) => {
	const { action } = node;

	const { chatter, syncer, instance: { scheduler } } = obj;

	if (action === 'chat') {
		if (!chatter)
			obj.addComponent('chatter');

		syncer.set(false, 'chatter', 'msg', node.msg);

		return true;
	}

	if (action === 'wait') {
		if (node.cron) {
			const isActive = scheduler.isActive(node);

			return isActive;
		} else if (node.ttl === undefined) {
			node.ttl = node.duration;

			return false;
		}

		node.ttl--;

		if (!node.ttl) {
			delete node .ttl;
			return true;
		}
	}
};

const getNextPatrolTarget = mob => {
	const { patrol, obj: { x, y } } = mob;
	let toX, toY;

	do {
		const toNode = patrol[mob.patrolTargetNode];
		if (toNode.action) {
			const nodeDone = performPatrolAction(mob, toNode);
			if (!nodeDone)
				return true;

			mob.patrolTargetNode++;
			if (mob.patrolTargetNode >= patrol.length)
				mob.patrolTargetNode = 0;

			continue;
		}

		toX = toNode[0];
		toY = toNode[1];
		if ((toX - x === 0) && (toY - y === 0)) {
			mob.patrolTargetNode++;
			if (mob.patrolTargetNode >= patrol.length)
				mob.patrolTargetNode = 0;
		} else
			break;
	} while (toX - x !== 0 || toY - y !== 0);

	return [ toX, toY ];
};

module.exports = {
	type: 'mob',

	target: null,

	physics: null,

	originX: 0,
	originY: 0,

	walkDistance: 1,
	maxChaseDistance: 25,
	goHome: false,

	patrol: null,
	patrolTargetNode: 0,

	needLos: null,

	init: function (blueprint) {
		this.physics = this.obj.instance.physics;

		this.originX = this.obj.x;
		this.originY = this.obj.y;

		if (blueprint.patrol)
			this.patrol = blueprint.patrol;

		if (blueprint.maxChaseDistance)
			this.maxChaseDistance = blueprint.maxChaseDistance;
	},

	/* eslint-disable-next-line max-lines-per-function */
	update: function () {
		let obj = this.obj;

		let target = null;
		if (obj.aggro)
			target = obj.aggro.getHighest();

		//Have we reached home?
		if (this.goHome) {
			let distanceFromHome = Math.max(abs(this.originX - obj.x), abs(this.originY - obj.y));
			if (!distanceFromHome) {
				this.goHome = false;
				if (!obj.spellbook) {
					/* eslint-disable-next-line no-console */
					console.log('MOB HAS NO SPELLBOOK BUT WANTS TO RESET ROTATION');
					/* eslint-disable-next-line no-console */
					console.log(obj.name, obj.zone, obj.zoneName, obj.x, obj.y, obj.components.map(c => c.type).join(','));
				}

				obj.spellbook.resetRotation();
			}
		}

		if (!this.goHome) {
			//Are we chasing a target too far from home?
			if (!obj.follower && target) {
				if (!this.canChase(target)) {
					obj.clearQueue();
					obj.aggro.unAggro(target);
					target = obj.aggro.getHighest();
				}
			}

			//Are we too far from home?
			let distanceFromHome = Math.max(abs(this.originX - obj.x), abs(this.originY - obj.y));
			if (distanceFromHome > this.maxChaseDistance)
				this.goHome = true;
			else if ((target) && (target !== obj) && ((!obj.follower) || (obj.follower.master !== target))) {
				//If we just started attacking, patrols need to know where home is
				if (!this.target && this.patrol) {
					this.originX = obj.x;
					this.originY = obj.y;
				}

				//Are we in fight mode?
				this.fight(target);
				return;
			} else if (!target && this.target) {
				//Is fight mode over?
				this.target = null;
				obj.clearQueue();
				obj.spellbook.resetRotation();

				if (canPathHome(this))
					this.goHome = true;
				else
					teleportHome(this.physics, obj, this);
			}
		}

		//If we're already going somewhere, don't calculate a new path
		if (obj.actionQueue.length > 0)
			return;

		//Unless we're going home, don't always move
		if (!this.goHome && rnd() < 0.85 && !this.patrol)
			return;

		//Don't move around if we're not allowed to, unless we're going home
		let walkDistance = this.walkDistance;
		if ((!this.goHome) && (walkDistance <= 0))
			return;

		let toX, toY;

		//Patrol mobs should not pick random locations unless they're going home
		if (this.goHome || !this.patrol) {
			toX = this.originX + ~~(rnd() * (walkDistance * 2)) - walkDistance;
			toY = this.originY + ~~(rnd() * (walkDistance * 2)) - walkDistance;
		} else if (this.patrol) {
			const patrolResult = getNextPatrolTarget(this);

			//When an action is performed, we will only get a boolean value back
			if (!patrolResult.push)
				return;

			[toX, toY] = patrolResult;
		}

		//We use goHome to force followers to follow us around but they should never stay in that state
		// since it messes with combat
		if (obj.follower)
			this.goHome = false;

		const dx = abs(obj.x - toX);
		const dy = abs(obj.y - toY);

		if (dx + dy === 0)
			return;

		if (dx <= 1 && dy <= 1) {
			obj.queue({
				action: 'move',
				data: {
					x: toX,
					y: toY
				}
			});

			return;
		}

		const path = this.physics.getPath({
			x: obj.x,
			y: obj.y
		}, {
			x: toX,
			y: toY
		}, false);

		const pLen = path.length;
		for (let i = 0; i < pLen; i++) {
			let p = path[i];

			obj.queue({
				action: 'move',
				data: {
					x: p.x,
					y: p.y
				}
			});
		}
	},

	fight: function (target) {
		let obj = this.obj;

		if (this.target !== target) {
			obj.clearQueue();
			this.target = target;
		}
		//If the target is true, it means we can't reach the target and should wait for a new one
		if (this.target === true)
			return;
		else if (obj.spellbook.isCasting())
			return;

		let x = obj.x;
		let y = obj.y;

		let tx = ~~target.x;
		let ty = ~~target.y;

		let distance = max(abs(x - tx), abs(y - ty));
		let furthestAttackRange = obj.spellbook.getFurthestRange(target, true);
		let furthestStayRange = obj.spellbook.getFurthestRange(target, false);

		let doesCollide = null;
		let hasLos = null;

		if (distance <= furthestAttackRange) {
			doesCollide = this.physics.mobsCollide(x, y, obj, target);
			if (!doesCollide) {
				hasLos = this.physics.hasLos(x, y, tx, ty);
				//Maybe we don't care if the mob has LoS
				if (hasLos || this.needLos === false) {
					let spell = obj.spellbook.getSpellToCast(target);
					if (!spell)
						return;

					let success = obj.spellbook.cast({
						spell: spell.id,
						target
					});

					//null means we don't have LoS
					if (success !== null)
						return;

					hasLos = false;
				}
			}
		} else if (furthestAttackRange === 0) {
			if (distance <= obj.spellbook.closestRange && !this.physics.mobsCollide(x, y, obj, target))
				return;
		}

		let targetPos = this.physics.getClosestPos(x, y, tx, ty, target, obj);
		if (!targetPos) {
			//Find a new target
			obj.aggro.ignore(target);
			//TODO: Don't skip a turn
			return;
		}
		let newDistance = max(abs(targetPos.x - tx), abs(targetPos.y - ty));

		if (newDistance >= distance && newDistance > furthestStayRange) {
			obj.clearQueue();
			obj.aggro.ignore(target);
			if (!obj.aggro.getHighest()) {
				//Nobody left to attack so reset our aggro table
				obj.aggro.die();
				this.goHome = true;
			}

			return;
		}

		if (abs(x - targetPos.x) <= 1 && abs(y - targetPos.y) <= 1) {
			obj.queue({
				action: 'move',
				data: {
					x: targetPos.x,
					y: targetPos.y
				}
			});
		} else {
			let path = this.physics.getPath({
				x: x,
				y: y
			}, {
				x: targetPos.x,
				y: targetPos.y
			});
			if (path.length === 0) {
				obj.aggro.ignore(target);
				//TODO: Don't skip a turn
				return;
			}

			let p = path[0];
			obj.queue({
				action: 'move',
				data: {
					x: p.x,
					y: p.y
				}
			});
		}
	},

	canChase: function (obj) {
		//Patrol mobs can always chase if they don't have a target yet (since they don't have a home yet)
		if (this.patrol && !this.target && !this.goHome)
			return true;

		let distanceFromHome = Math.max(abs(this.originX - obj.x), abs(this.originY - obj.y));
		return ((!this.goHome) && (distanceFromHome <= this.maxChaseDistance));
	},

	events: {
		beforeTakeDamage: function (msg) {
			if (this.goHome)
				msg.failed = true;
		}
	}
};
