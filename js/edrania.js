/**
 * Get current level of player
 * @return {int}
 */
function getPlayerLevel() {
	return parseInteger($('#gladStatus table tbody tr:nth(1) td').text());
}

/**
 * Get players max HP
 * @return {int}
 */
function getPlayerMaxHP() {
	const hp = $('#gladStatus table tbody tr:nth(0) td').text();
	const hpArr = hp.split('/');
	return parseInteger(hpArr[1]);
}

/**
 * Get players time
 * @return {int}
 */
function getPlayerTime() {
	return parseInteger($('#gladStatus table tbody tr:nth(3) td').text());
}

/**
 * Get players name
 * @return {string}
 */
function getPlayerName() {
	return $('.right-content-bg:nth(1) h5').text();
}

/**
 * Round a number to decimals
 * @param  {float} number
 * @param  {int}   decimals
 * @return {float}
 */
function round(number, decimals)
{
	return parseFloat(number.toFixed(decimals));
}

/**
 * Parse integer from string, explicitly using base 10, as is good practice.
 *
 * See: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/parseInteger
 *
 * @param  {string} value
 * @return {int}
 */
function parseInteger(value) 
{
	return parseInt(value, 10);
}

function refreshPlayerStatus()
{
	$('#gladStatus').trigger('click');
}

// Display how much hp each threshold is
const playerHP = getPlayerMaxHP();
$('select[name=RetreatThreshold] option').each(function(){
	const value = parseInteger($(this).val());
	const thresholdHP = parseInteger(playerHP * (value / 100));
	$(this).append(' (' + thresholdHP + ' hp)');
});

chrome.storage.sync.get('edraniaConfig', function(data){
	edraniaConfig = data.edraniaConfig;
	if (edraniaConfig === undefined) {
		edraniaConfig = {};
	}

	prefillClass = new Prefill();

	// Init hover info for links
	hoverInfo = new HoverInfo();

	// Profile client
	profile = new Profile();

	// Init quick shop for tavern
	new Tavern();

	// Add button for opening talen calculator
	const talentCalculator = new TalentCalculator();
	const $openCalculator = $('<a class="black" href="#">Talent calculator</a>');
	$openCalculator.on('click', function(){
		talentCalculator.openCalculator();
		return false;
	});
	const $li = $('<li>');
	$li.append($openCalculator);
	$('.side-menu:first .menu-list:first').append($li);

	let path = location.pathname;
	// Add trailing slash to path if missing
	if (path.slice(-1) !== '/') {
		path += '/';
	}

	if (path === '/Auction/') {
		new Auction();
	}
	else if (path.startsWith('/Vendor/Browse/') && edraniaConfig.purchaseEquipmentWithoutConfirm) {
		new Vendor();
	}
	else if (path === '/TeamGame/') {
		new TeamGame('list');
	}
	else if (path === '/TeamGame/Create/') {
		new TeamGame('create');
	}
	else if (path.search('/TeamGame/View/') > -1) {
		new TeamGame('view');
	}
	else if (path.search('/MyGlad/Challenges/In/') > -1) {
		new Challenges('incoming');
	}
	else if (path.search('/MyGlad/Challenges/Out/') > -1) {
		new Challenges('outgoing');
	}
	else if (path.search('/MyGlad/Profile/Biography/Edit/') > -1) {
		const regex = /(?<=\[plugin\])[\w\W]*(?=\[\/plugin\])/g;
		const matches = $('.container').find('textarea').val().match(regex);

		let text = '';
		if (matches !== null) {
			text = matches[0].replaceAll(/[<>]*/g, '').substr(0, 200);
		}

		$('.container').after('<div class="chrome-plugin-alert"><b>Plugin:</b><br>'
			+ 'Du kan lägga till text i din biografi som du vill visa när någon hovrar över din gladiator.<br>'
			+ 'Du gör detta genom att lägga till <b>[plugin]Text som ska visas[/plugin]</b> i din biografi.<br>'
			+ 'Texten som visas är begränsad till 200 tecken.<br><br>'
			+ '<b>Text som kommer att visas:</b><br>' + text
			+'</div>');
	}
	else if (path.startsWith('/Duel/Reports/')) {
		new DuelReport();
	}
	else if (path.startsWith('/Work/')) {
		new WorkDistrict();
	}
	else if (path === '/Workshop/') {
		new Workshop('list');
	}
	else if (path === '/Workshop/NewProject/') {
		new Workshop('new');
	}
	else if (path === '/MyGlad/LevelUp/') {
		talentCalculator.placeLevelUp();
	}
	else if (path === '/CreateGlad/CreateGladSecond/') {
		$('h3').after($openCalculator);
		talentCalculator.placeLevelUp();
	}
});
