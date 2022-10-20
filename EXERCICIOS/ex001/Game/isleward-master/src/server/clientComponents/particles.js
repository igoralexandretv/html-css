define([
	'js/rendering/renderer'
], function (
	renderer
) {
	return {
		type: 'particles',
		emitter: null,

		init: function (blueprint) {
			this.blueprint = this.blueprint || {};
			this.blueprint.pos = {
				x: (this.obj.x * scale) + (scale / 2),
				y: (this.obj.y * scale) + (scale / 2)
			};
			this.ttl = blueprint.ttl;
			this.blueprint.obj = this.obj;

			this.emitter = renderer.buildEmitter(this.blueprint);

			this.setVisible(this.obj.isVisible);
		},

		setVisible: function (visible) {
			//Sometimes, we make emitters stop emitting for a reason
			// for example, when an explosion stops
			if (!this.emitter.disabled)
				this.emitter.emit = visible;
		},

		update: function () {
			const { ttl, destroyObject, emitter, obj } = this;

			if (ttl !== null) {
				this.ttl--;
				if (this.ttl <= 0) {
					if (destroyObject)
						this.obj.destroyed = true;
					else
						this.destroyed = true;
					return;
				}
			}

			if (!emitter.emit)
				return;

			emitter.spawnPos.x = (obj.x * scale) + (scale / 2) + obj.offsetX;
			emitter.spawnPos.y = (obj.y * scale) + (scale / 2) + obj.offsetY;
		},

		destroy: function () {
			renderer.destroyEmitter(this.emitter);
		}
	};
});
