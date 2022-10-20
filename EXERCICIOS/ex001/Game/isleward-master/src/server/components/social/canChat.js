module.exports = (obj, time) => {
	const accountLevel = obj.auth.getAccountLevel();
	if (accountLevel >= 5)
		return true;

	if (!time)
		time = +new Date();

	const playerLevel = obj.level;
	const playedTime = obj.stats.stats.played * 1000;
	const sessionStart = obj.player.sessionStart;
	const sessionDelta = time - sessionStart;

	const canChat = (playerLevel >= 3 || playedTime + sessionDelta >= 180000);

	return canChat;
};
