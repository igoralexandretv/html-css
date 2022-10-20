module.exports = {
	applyItemStats: ({ stats: objStats }, { stats, implicitStats = [] }, isEq) => {
		for (let s in stats) {
			const value = stats[s];
			const useValue = isEq ? value : -value;
			objStats.addStat(s, useValue);
		}

		implicitStats.forEach(({ stat, value }) => {
			const useValue = isEq ? value : -value;
			objStats.addStat(stat, useValue);
		});
	}
};
