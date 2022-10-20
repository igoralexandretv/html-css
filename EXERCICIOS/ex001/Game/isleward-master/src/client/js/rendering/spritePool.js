define([
	
], function (
	
) {
	return {
		pool: {},

		clean: function () {
			this.pool = {};
		},

		getSprite: function (type) {
			let list = this.pool[type];
			if (!list)
				return null;
			else if (list.length === 0)
				return null;
			return list.pop();
		},

		store: function (sprite) {
			let pool = this.pool;
			let type = sprite.type;
			if (sprite.scale.x < 0)
				type = 'flip' + type;
			let list = pool[type];
			if (!list) 
				list = pool[type] = [];

			delete sprite.isFake;

			list.push(sprite);
		}
	};
});
