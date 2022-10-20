module.exports = {
	isItemStackable: function (item) {
		return (item.material || item.quest || item.quantity) && (!item.noStack) && (!item.uses);
	}
};
