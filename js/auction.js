class Auction
{
	constructor()
	{
		this.initSearchPage();
	}

	initSearchPage()
	{
		// Create observer for changes on incoming table
		new EdraniaObserver($('#auctionTblBody')[0], () => {hoverInfo.initHover()});
	}
}