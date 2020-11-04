class Auction
{
	constructor()
	{
		// Create new elements
		const $input = $('<input>');
		$input.attr('placeholder', 'Sök...');
		$input.on('keyup', (event) => {this.search(event)});

		$('.compact-table').before($input);
	}

	/**
	 * Filter auctions table
	 */
	search()
	{
		const $input = $(event.currentTarget);
		const value = $input.val();

		$('.compact-table tbody tr').each(function(){
			const $tr = $(this);

			const name = $tr.find('td:first a').text();
			if (name.search(new RegExp(value, 'i')) === -1) {
				$tr.hide();
			}
			else {
				$tr.show();
			}
		});
	}
}

class TeamGame
{
	constructor(action)
	{
		switch (action) {
			case 'create':
				break;

			case 'list':
				this.setupFilter();		
				break;
		}

		$('input, select').on('change', (event) => {prefillClass.savePrefill('teamGamePrefill', event)});
		prefillClass.prefillInputs('teamGamePrefill');
	}

	/**
	 * Setup filter for list
	 */
	setupFilter()
	{
		// Add filter for hiding games that are too high or too low level for the player
		const $input = $('<input class="js-list-filter" type="checkbox" name="hideOutOfLevel">');
		$input.on('change', (event) => {this.filterList(event)});

		const $label = $('<label>');
		$label.append($input).append(' Visa bara för din grad');

		$('.compact-table').before($label);
	}

	/**
	 * Filter game lsit
	 */
	filterList(event)
	{
		$('.js-list-filter').each(function(){
			let $input = $(this);

			switch ($input.attr('name')) {
				case 'hideOutOfLevel':
					if ($input.is(':checked')) {
						$('.compact-table tbody tr').each(function(){
							const $tr = $(this);

							const levels = $tr.find('td:nth(2)').text().split(' - ');
							const playerLevel = getPlayerLevel();

							if (parseInt(levels[0]) > playerLevel || parseInt(levels[1]) < playerLevel) {
								$tr.hide();
							}
							else {
								$tr.show();
							}
						});
					}
					else {
						$('.compact-table tbody tr').show();
					}
					break;
			}
		});
	}
}

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