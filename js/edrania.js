/**
 * Get current level of player
 * @return {int}
 */
function getPlayerLevel() {
	return parseInt($('#gladStatus table tbody tr:nth(1) td').text());
}

/**
 * Get players max HP
 * @return {int}
 */
function getPlayerMaxHP() {
	const hp = $('#gladStatus table tbody tr:nth(0) td').text();
	const hpArr = hp.split('/');
	return parseInt(hpArr[1]);
}

// Display how much hp each threshold is
const playerHP = getPlayerMaxHP();
$('select[name=RetreatThreshold] option').each(function(){
	const value = parseInt($(this).val());
	const thresholdHP = parseInt(playerHP * (value / 100));
	$(this).append(' (' + thresholdHP + ' hp)');
});

chrome.storage.sync.get('edraniaConfig', function(data){
	edraniaConfig = data.edraniaConfig;
	if (edraniaConfig === undefined) {
		edraniaConfig = {};
	}

	prefillClass = new Prefill();

	// Init hover info for links
	new HoverInfo();

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
});