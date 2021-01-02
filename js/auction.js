class Auction
{
	constructor()
	{
		this.hoverTimeout = null;

		this.setupMyAuctions();
	}

	setupSearch()
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

	/**
	 * Setup my auctions
	 */
	setupMyAuctions()
	{
		const $header = $('#header');
		const $pluginBanner = $('<div class="chrome-plugin-banner">');
		$pluginBanner.css('width', $('.header-banner').width() + 'px');

		const $myAuctions = $('<span>Mina auktioner</span>');

		$myAuctions.on('mouseenter', () => {
			this.hoverTimeout = setTimeout(() => {
				this.loadMyAuctions();
			}, 100);
		})
		.on('mouseleave', () => {
			clearTimeout(this.hoverTimeout);

			$('.chrome-plugin-my-auctions').remove();
		});

		$pluginBanner.append($myAuctions);

		$header.after($pluginBanner);
	}

	loadMyAuctions()
	{
		$.get('/Auction/MyAuctions/0/', (html) => {
			this.renderMyAuctions(html);
		});
	}

	renderMyAuctions(html)
	{
		const $auctions = $(html).find('.compact-table');

		const $myAuctions = $('<div class="chrome-plugin-my-auctions chrome-plugin-info-box">');
		$myAuctions.html($auctions);

		$('.chrome-plugin-banner').after($myAuctions);
	}
}