class Challenges
{
	constructor(action)
	{
		switch (action) {
			case 'incoming':
				this.initIncoming();
				break;

			case 'outgoing':
				// Nothing here yet
				break;
		}
		
	}

	/**
	 * Setup incoming page
	 */
	initIncoming()
	{
		// Add check all to thead
		$('.compact-table thead tr').prepend('<td width="20"><input class="js-check-all" type="checkbox"></td>');
		$('.js-check-all').on('change', function(){
			$('.compact-table tbody input[type=checkbox]').prop('checked', $(this).is(':checked'));
		});

		$('.compact-table tbody tr').each(function(index, el){
			const $tr = $(this);

			// Find title for challengers and add them to the table
			const $a = $tr.find('td:first a');
			const title = $a.attr('title');
			$a.attr('title', '');

			$a.after('<span class="chrome-plugin-challenger">(' + title + ')</span>');

			// Add checkbox for multi cancel
			const $td = $tr.find('td:nth(3)');
			const cancelURL = $td.find('form').attr('action');
			const requestToken = $td.find('form input[name="__RequestVerificationToken"]').val();

			$tr.prepend('<td><input class="js-cancel-challenge" type="checkbox" value="' + cancelURL + '" data-token="' + requestToken + '"></td>');
		});

		// Add button for remove
		const $a = $('<a class="chrome-plugin-btn" href="#">Neka checkade</a>');
		$a.on('click', (event) => {this.deleteIncomingChallenges(event)});

		$('.compact-table').before($a);
	}

	/**
	 * Delete incoming challenges
	 */
	deleteIncomingChallenges(event)
	{
		event.preventDefault();

		if (!confirm('Är du säker?')) {
			return false;
		}

		const numChecked = $('.js-cancel-challenge:checked').length;

		$('.js-cancel-challenge:checked').each(function(index, el){
			const url = $(this).val();
			const data = {
				__RequestVerificationToken: $(this).data('token')
			};

			$.post(url, data, () => {
				$(this).parents('tr').remove();

				// Reload when all is done to load new challengers
				if (index + 1 === numChecked) {
					location.reload();
				}
			});
		});
	}
}