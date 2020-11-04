/**
 * Get current level of player
 * @return {int}
 */
function getPlayerLevel() {
	return parseInt($('#gladStatus table tbody tr:nth(1) td').text());
}

prefillClass = new Prefill();

if (location.pathname === '/Auction') {
	new Auction();
}
else if (location.pathname === '/TeamGame/') {
	new TeamGame('list');
}
else if (location.pathname === '/TeamGame/Create') {
	new TeamGame('create');
}
else if (location.pathname.search('/MyGlad/Challenges/In') > -1) {
	new Challenges('incoming');
}
else if (location.pathname.search('/MyGlad/Challenges/Out') > -1) {
	new Challenges('outgoing');
}