class Auction
{
	constructor()
	{
		this.initSearchPage();
	}

	initSearchPage()
	{
		// Create observer for changes on incoming table
		const $table = $('#auctionTblBody')[0];
		const config = {
			childList: true,
			subtree: true
		};

		const observer = new MutationObserver(function(){hoverInfo.initHover()});
		observer.observe($table, config);
	}
}