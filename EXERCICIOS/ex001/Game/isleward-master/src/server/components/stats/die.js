const loseXpOnDeath = ({ stats: { values }, syncer }, deathSource) => {
	const { xp, xpMax, level } = values;

	const noLoseXp = (
		level < 5 ||
		deathSource.player ||
		(
			deathSource.follower &&
			deathSource.follower.master &&
			deathSource.follower.master.player
		)
	);

	if (noLoseXp)
		return 0;
			
	const xpLoss = ~~Math.min(xp, xpMax * 0.05);

	values.xp -= xpLoss;
	syncer.setObject(true, 'stats', 'values', 'xp', values.xp);

	return xpLoss;
};

const die = (cpnStats, deathSource) => {
	const { obj, syncer: syncerGlobal } = cpnStats;
	const { x, y, serverId, syncer } = obj;

	syncerGlobal.queue('onGetDamage', {
		id: obj.id,
		event: true,
		text: 'death'
	}, -1);

	syncer.set(true, null, 'dead', true);

	const syncO = syncer.o;

	obj.hidden = true;
	obj.nonSelectable = true;
	syncO.hidden = true;
	syncO.nonSelectable = true;

	const xpLoss = loseXpOnDeath(obj, deathSource);

	syncerGlobal.queue('onDeath', {
		source: deathSource.name,
		xpLoss: xpLoss
	}, [serverId]);

	syncerGlobal.queue('onGetObject', {
		x,
		y,
		components: [{
			type: 'attackAnimation',
			row: 0,
			col: 4
		}]
	}, -1);
};

module.exports = die;
