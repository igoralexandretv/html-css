module.exports = {
	init: function (event) {
		const { config, rewards, eventManager: eManager } = event;

		const { name: eventName, rewardSenderName } = config;

		const subject = `${eventName} Rewards`;

		Object.entries(rewards).forEach(e => {
			const [ name, rList ] = e;

			if (!rList | !rList.length)
				return;

			//Hack: Mail is a mod. As such, events should be a mod that depends on mail
			if (global.mailManager) {
				global.mailManager.sendSystemMail({
					to: name,
					from: rewardSenderName,
					subject,
					msg: '',
					items: rList,
					notify: true
				});
			}
		});

		if ((config.events) && (config.events.afterGiveRewards))
			config.events.afterGiveRewards(eManager, config);

		this.end = true;
	}
};
