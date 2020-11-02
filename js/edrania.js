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

		$('.compact-table 	tbody').find('tr').each(function(){
			const $tr = $(this);

			const name = $tr.find('td:first a').text();
			if (name.search(new RegExp(value, 'i')) === -1) {
				$tr.css('display', 'none');
			}
			else {
				$tr.css('display', 'table-row');
			}
		});
	}
}

class TeamGame
{
	constructor()
	{
		this.bindEvents();
		this.prefillInputs();
	}

	/**
	 * Bind events to inputs
	 */
	bindEvents()
	{
		$('input, select').on('change', (event) => {this.savePrefill(event)});
	}

	getPrefill()
	{
		let teamGamePrefill = localStorage.getItem('teamGamePrefill');

		if (teamGamePrefill === null) {
			teamGamePrefill = {};
		}
		else {
			teamGamePrefill = JSON.parse(teamGamePrefill);
		}

		return teamGamePrefill;
	}

	/**
	 * Save to local storage
	 */
	savePrefill(event)
	{
		const $input = $(event.currentTarget);
		let teamGamePrefill = this.getPrefill();

		if ($input.is(':checkbox')) {
			teamGamePrefill[$input.attr('name')] = $input.is(':checked') ? true : false;
		}
		else {
			teamGamePrefill[$input.attr('name')] = $input.val();
		}

		localStorage.setItem('teamGamePrefill', JSON.stringify(teamGamePrefill));
	}

	/**
	 * Prefill inputs from local storage
	 */
	prefillInputs()
	{
		const teamGamePrefill = this.getPrefill();

		$('input').each(function(){
			let $input = $(this);

			let value = teamGamePrefill[$input.attr('name')];
			if (value === undefined) {
				return;
			}

			if ($input.is(':checkbox')) {
				if (value) {
					$input.trigger('click');
				}
			}
			else {
				$input.val(value);
			}
		});

		$('select').each(function(){
			let $select = $(this);

			let value = teamGamePrefill[$select.attr('name')];
			if (value === undefined) {
				return;
			}

			$select.val(value).trigger('change');
		});
	}
}

switch (location.pathname) {
	case '/Auction':
		const auktion = new Auction();
		break;

	case '/TeamGame/Create':
		const geamGame = new TeamGame();
		break;
}