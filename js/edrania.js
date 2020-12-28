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

/**
 * Get players time
 * @return {int}
 */
function getPlayerTime() {
	return parseInt($('#gladStatus table tbody tr:nth(3) td').text());
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

	let path = location.pathname;
	// Add trailing slash to path if missing
	if (path.slice(-1) !== '/') {
		path += '/';
	}

	if (path === '/Auction/') {
		new Auction();
	}
	else if (path === '/TeamGame/') {
		new TeamGame('list');
	}
	else if (path === '/TeamGame/Create/') {
		new TeamGame('create');
	}
	else if (path.search('/MyGlad/Challenges/In/') > -1) {
		new Challenges('incoming');
	}
	else if (path.search('/MyGlad/Challenges/Out/') > -1) {
		new Challenges('outgoing');
	}
	else if (path === '/Work/') {
		// Set highest possible time player can work
		const $select = $('select[name=Time]');
		const playerTime = getPlayerTime();

		$select.find('option').each(function(){
			const time = $(this).val();
			if (time <= playerTime) {
				$select.val(time).trigger('change');
				return false;
			}
		});
	}
});