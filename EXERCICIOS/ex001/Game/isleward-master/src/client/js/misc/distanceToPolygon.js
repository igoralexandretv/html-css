define([

], function (

) {
	return {
		distanceBetweenPoints: function (a, b) {
			return Math.sqrt(Math.pow(a[0] - b[0], 2) + Math.pow(a[1] - b[1], 2));
		},

		distanceToLine: function (p, la, lb) {
			let xD = lb[0] - la[0];
			let yD = lb[1] - la[1];

			let u = (((p[0] - la[0]) * xD) + ((p[1] - la[1]) * yD)) / ((xD * xD) + (yD * yD));

			let closestLine;
			if (u < 0)
				closestLine = [la[0], la[1]];
			else if (u > 1)
				closestLine = [lb[0], lb[1]];
			else
				closestLine = [la[0] + (u * xD), la[1] + (u * yD)];

			return this.distanceBetweenPoints(p, closestLine);
		},

		calculate: function (p, verts) {
			let minDistance = 9999;

			let vLen = verts.length;
			for (let i = 0, j = vLen - 1; i < vLen; j = i++) {
				let vi = verts[i];
				let vj = verts[j];

				let distance = this.distanceToLine(p, vi, vj);
				if (distance < minDistance)
					minDistance = distance;
			}

			return minDistance;
		}
	};
});
