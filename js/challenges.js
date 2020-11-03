class Challenges
{
	constructor()
	{
		this.displayTooltop();
	}

	/**
	 * Find title for challengers and add them to the table
	 */
	displayTooltop()
	{
		$('.compact-table tbody tr').each(function(index, el){
			const $a = $(this).find('td:first a');
			const title = $a.attr('title');

			$a.after('<span class="challenger">(' + title + ')</span>')
		});
	}
}