module.exports = {
	type: 'casting',

	events: {
		beforeMove: function (targetPos) {
			let obj = this.obj;

			targetPos.x = obj.x;
			targetPos.y = obj.y;
		},

		beforeCastSpell: function (successObj) {		
			successObj.success = false;
		}
	}
};
