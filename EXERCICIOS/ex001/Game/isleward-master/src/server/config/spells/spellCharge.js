module.exports = {
	type: 'charge',

	cdMax: 20,
	manaCost: 10,
	range: 9,

	damage: 1,
	speed: 70,
	isAttack: true,

	stunDuration: 15,
	needLos: true,

	cast: function (action) {
		let obj = this.obj;
		let target = action.target;

		let x = obj.x;
		let y = obj.y;

		let dx = target.x - x;
		let dy = target.y - y;

		//We need to stop just short of the target
		let offsetX = 0;
		if (dx !== 0)
			offsetX = dx / Math.abs(dx);

		let offsetY = 0;
		if (dy !== 0)
			offsetY = dy / Math.abs(dy);

		let targetPos = {
			x: target.x,
			y: target.y
		};

		let physics = obj.instance.physics;
		//Check where we should land
		if (!this.isTileValid(physics, x, y, targetPos.x - offsetX, targetPos.y - offsetY)) {
			if (!this.isTileValid(physics, x, y, targetPos.x - offsetX, targetPos.y)) 
				targetPos.y -= offsetY;
			else 
				targetPos.x -= offsetX;
		} else {
			targetPos.x -= offsetX;
			targetPos.y -= offsetY;
		}

		let distance = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
		let ttl = distance * this.speed;

		let targetEffect = target.effects.addEffect({
			type: 'stunned'
		});

		let selfEffect = this.obj.effects.addEffect({
			type: 'stunned',
			silent: true,
			force: true
		});

		const moveAnimationEffect = {
			type: 'moveAnimation',
			idTarget: target.id,
			targetX: targetPos.x,
			targetY: targetPos.y,
			ttl: ttl
		};
		this.obj.fireEvent('beforeAddSpellEffect', this, moveAnimationEffect);

		this.sendAnimation({
			id: this.obj.id,
			components: [moveAnimationEffect]
		});

		if (this.animation) {
			this.obj.instance.syncer.queue('onGetObject', {
				id: this.obj.id,
				components: [{
					type: 'animation',
					template: this.animation
				}]
			}, -1);
		}

		this.queueCallback(this.reachDestination.bind(this, target, targetPos, targetEffect, selfEffect), ttl - 50);

		return true;
	},
	reachDestination: function (target, targetPos, targetEffect, selfEffect) {
		if (this.obj.destroyed)
			return;

		let obj = this.obj;

		obj.instance.physics.removeObject(obj, obj.x, obj.y);

		obj.x = targetPos.x;
		obj.y = targetPos.y;

		let syncer = obj.syncer;
		syncer.o.x = targetPos.x;
		syncer.o.y = targetPos.y;

		obj.instance.physics.addObject(obj, obj.x, obj.y);

		obj.effects.removeEffect(selfEffect.id);

		this.obj.aggro.move();

		if (targetEffect)
			targetEffect.ttl = this.stunDuration;

		let damage = this.getDamage(target);
		target.stats.takeDamage(damage, this.threatMult, obj);

		const moveEvent = {
			newPos: targetPos,
			source: this
		};
		this.obj.fireEvent('afterPositionChange', moveEvent);

		if (this.castOnEnd)
			this.obj.spellbook.spells[this.castOnEnd].cast();
	},

	isTileValid: function (physics, fromX, fromY, toX, toY) {
		if (physics.isTileBlocking(toX, toY))
			return false;
		return physics.hasLos(fromX, fromY, toX, toY);
	}
};
