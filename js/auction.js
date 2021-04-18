class Auction
{
	constructor()
	{
		this.initTableChangeObserver();
		this.initPersistentFilter();

		$('#freeSearch').focus();
	}

	applyFreeSearchFilter()
	{
		const $search = $('#freeSearch');
		const query = $search.val();

		if (typeof query === "undefined" || query.length === 0) {
			return;
		}

		// Why a native event?
		// Our version of jQuery is not run in the same sandbox as the page's jQuery.
		// Hence, the synthetic jQuery events cache is not shared.
		const keyUpEvent = new KeyboardEvent('keyup');
		$search[0].dispatchEvent(keyUpEvent);
	}

	initTableChangeObserver()
	{
		// Create observer for changes on incoming table
		new EdraniaObserver($('#auctionTblBody')[0], () => {
			hoverInfo.initHover();
			this.applyFreeSearchFilter();
		});
	}

	initPersistentFilter()
	{
		const fieldByName = {
			search: $('#freeSearch'),
			'min-level': $('#minLevel'),
			'max-level': $('#maxLevel'),
			category: $('#itemCategory'),
			type: $('#itemType'),
			race: $('#raceRequirement'),
		};
		const defaultValueByName = {
			search: "",
			"min-level": "1",
			"max-level": "99",
			category: "-1",
			type: "-1",
			race: "-1",
		};

		new PersistentFilter(fieldByName, defaultValueByName);
	}
}
