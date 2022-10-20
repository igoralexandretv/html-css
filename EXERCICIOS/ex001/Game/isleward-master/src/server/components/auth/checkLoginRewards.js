const scheduler = require('../../misc/scheduler');
const rewardGenerator = require('../../misc/rewardGenerator');

const maxRewardedDays = 21;

const calculateDaysSkipped = (oldTime, newTime) => {
	let daysSkipped = 1;

	if (oldTime.year === newTime.year && oldTime.month === newTime.month) { 
		//Same year and month
		daysSkipped = newTime.day - oldTime.day;
	} else if (oldTime.year === newTime.year) {
		//Same month
		let daysInMonth = scheduler.daysInMonth(oldTime.month);
		daysSkipped = (daysInMonth - oldTime.day) + newTime.day;

		for (let i = oldTime.month + 1; i < newTime.month - 1; i++) 
			daysSkipped += scheduler.daysInMonth(i);
	} else {
		//Different year and month
		const daysInMonth = scheduler.daysInMonth(oldTime.month);
		daysSkipped = (daysInMonth - oldTime.day) + newTime.day;

		for (let i = oldTime.year + 1; i < newTime.year - 1; i++)
			daysSkipped += 365;

		for (let i = oldTime.month + 1; i < 12; i++) 
			daysSkipped += scheduler.daysInMonth(i);

		for (let i = 0; i < newTime.month - 1; i++) 
			daysSkipped += scheduler.daysInMonth(i);
	}

	return daysSkipped;
};

module.exports = async (cpnAuth, data, character, cbDone) => {
	const accountInfo = cpnAuth.accountInfo;

	const time = scheduler.getTime();
	let { lastLogin, loginStreak } = accountInfo;

	accountInfo.lastLogin = time;

	if (
		!lastLogin ||
		(
			lastLogin.day === time.day &&
			lastLogin.month === time.month &&
			lastLogin.year === time.year
		)
	) {
		cbDone();
		
		return;
	}

	const daysSkipped = calculateDaysSkipped(lastLogin, time);
	if (daysSkipped === 1)
		loginStreak++;
	else
		loginStreak = 1;

	accountInfo.loginStreak = loginStreak;

	const cappedLoginStreak = Math.max(1, Math.min(maxRewardedDays, loginStreak));
	const itemCount = 1 + ~~(cappedLoginStreak / 2);
	const rewards = rewardGenerator(itemCount);
	if (!rewards) {
		cbDone();

		return;
	}

	const msg = `Daily login reward for ${loginStreak} day${(loginStreak > 1) ? 's' : ''}`;

	//Hack: Mail is a mod. As such, events should be a mod that depends on mail
	if (global.mailManager) {
		await global.mailManager.sendSystemMail({
			to: character.name,
			subject: 'Login Rewards',
			msg,
			items: rewards
		});
	}

	cbDone();
};
