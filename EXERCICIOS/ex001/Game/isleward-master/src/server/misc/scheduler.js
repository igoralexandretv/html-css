module.exports = {
	cd: 1000,

	lastTime: null,

	init: function () {
		this.lastTime = this.getTime();
	},

	update: function () {
		this.lastTime = this.getTime();
	},

	isActive: function (c) {
		let cron = c.cron.split(' ');
		if (cron.length !== 5)
			return false;

		let time = this.getTime();

		return ['minute', 'hour', 'day', 'month', 'weekday'].every((t, i) => {
			let f = cron[i].split('-');
			if (f[0] === '*')
				return true;

			let useTime = time[t];

			if (f.length === 1) {
				f = f[0].split('/');
				if (f.length === 1) {
					const options = f[0].split(',');
					const isOk = options.some(o => {
						return ~~o === useTime;
					});
					return isOk;
				}
				return ((useTime % f[1]) === 0);
			}
			return ((useTime >= f[0]) && (useTime <= f[1]));
		});
	},

	shouldRun: function (c) {
		let cron = c.cron.split(' ');
		if (cron.length !== 5)
			return false;

		let lastTime = this.lastTime;
		let time = this.getTime();

		let lastRun = c.lastRun;
		if (lastRun) {
			if (Object.keys(lastRun).every(e => (lastRun[e] === time[e])))
				return false;
		}

		let timeOverflows = [60, 24, 32, 12, 7];

		let run = ['minute', 'hour', 'day', 'month', 'weekday'].every(function (t, i) {
			let tCheck = cron[i];

			if (tCheck === '*')
				return true;
			
			let overflow = timeOverflows[i];
			let timeT = time[t];
			let lastTimeT = lastTime[t];
			if (timeT < lastTimeT)
				timeT += overflow;
			else if (timeT > lastTimeT)
				lastTimeT++;

			tCheck = tCheck.split(',');

			return Array
				.apply(null, Array(1 + timeT - lastTimeT))
				.map((j, k) => (k + lastTimeT))
				.some(function (s) {
					let useTime = (s >= overflow) ? (s - overflow) : s;

					return tCheck.some(function (f) {
						f = f.split('-');
						if (f.length === 1) {
							f = f[0].split('/');
							if (f.length === 1)
								return (useTime === ~~f[0]);
							return ((useTime % f[1]) === 0);
						}
						return ((useTime >= f[0]) && (useTime <= f[1]));
					});
				});
		});

		if (run)
			c.lastRun = time;

		return run;
	},

	getTime: function () {
		let time = new Date();

		return {
			minute: time.getMinutes(),
			hour: time.getHours(),
			day: time.getDate(),
			month: time.getMonth() + 1,
			year: time.getUTCFullYear(),
			weekday: time.getDay()
		};
	},

	daysInMonth: function (month) {
		let year = (new Date()).getYear();

		return new Date(year, month, 0).getDate();
	}
};
