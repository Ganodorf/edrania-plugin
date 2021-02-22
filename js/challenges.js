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
	 * Init incoming page event listeners
	 */
	initIncoming()
	{
		// Create observer for changes on incoming table
		new EdraniaObserver($('.compact-table')[0], this.setupIncoming);

		this.setupIncoming();
	}

	/**
	 * Actually setup incoming page
	 */
	setupIncoming()
	{
		// We have to reset hover listeners for gladiator links in case of list has been reloaded by level filter
		hoverInfo.initHover();

		// Remove title for challengers
		$('.compact-table tbody tr').each(function(index, el){
			const $tr = $(this);

			const $a = $tr.find('td:nth(1) a');
			$a.attr('title', '');
		});
	}
}
