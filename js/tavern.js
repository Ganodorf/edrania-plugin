class Tavern
{
	constructor()
	{
		// Create quick shop
		const $quickShop = $('<div>');
		$quickShop.append('<b>Snabbmat <span class="chrome-plugin-tiny-text">(köper direkt)</span></b><br>');

		$quickShop.append('<a class="js-tavern-buy black" href="#" data-action="/Tavern/Purchase/1/">Äpple 5 mynt (5hp)</a><br>');

		const playerHP = getPlayerMaxHP();
		const loafHeal = parseInteger(playerHP * 0.1);
		$quickShop.append('<a class="js-tavern-buy black" href="#" data-action="/Tavern/Purchase/3/">Bröd 20 mynt (' + loafHeal + 'hp)</a>');

		$('.side-menu:first').append($quickShop);
		$('.js-tavern-buy').on('click', this.buyItem);
	}

	/**
	 * Buy an item
	 */
	buyItem()
	{
		const action = $(this).data('action');

		$.post(action, () => {
			playerStatus.refresh();
		});

		return false;
	}
}
