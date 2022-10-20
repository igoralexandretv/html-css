const sendObjToZone = require('../portal/sendObjToZone');

module.exports = (cpnSocial, targetZone) => {
	const { obj } = cpnSocial;

	if (obj.zoneName === targetZone)
		return;

	sendObjToZone({
		obj,
		zoneName: targetZone
	});
};
