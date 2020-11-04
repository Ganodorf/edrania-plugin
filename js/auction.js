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