class Vendor
{
	constructor()
	{
		this.purchaseRequest = null;
		this.initPurchaseEquipmentWithoutConfirm();
	}

	initPurchaseEquipmentWithoutConfirm()
	{
		$('.table-body-border tr').each((_, tableRow) => {
			const $purchaseButton = $(tableRow).find('a[href^="/Vendor/Purchase/"]');
			const itemID = $purchaseButton.attr('href').split('/').pop();

			$purchaseButton.on('click', (event) => {
				event.preventDefault();

				if (this.purchaseRequest !== null) {
					return;
				}

				this.purchaseRequest = $.post('/Vendor/PurchaseItem/', {ItemID: itemID}, () => {
					this.purchaseSuccess($purchaseButton);
				}).always(() => {
					this.purchaseRequest = null;
				});
			});
		})
	}

	purchaseSuccess($purchaseButton)
	{
		playerStatus.refresh();

		const $span = $('<b class="text-success">Köpte</b>');
		$purchaseButton.hide().after($span);
		$span.fadeOut(1000, function() {
			$purchaseButton.show();
		});
	}
}
