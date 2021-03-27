class Vendor
{
	constructor()
	{
		this.initPurchaseEquipmentWithoutConfirm();
	}

	initPurchaseEquipmentWithoutConfirm()
	{
		$('.table-body-border tr').each((_, tableRow) => {
			const $purchaseButton = $(tableRow).find('a[href^="/Vendor/Purchase/"]');
			const itemID = $purchaseButton.attr('href').split('/').pop();

			$purchaseButton.on('click', (event) => {
				event.preventDefault();

				$.post('/Vendor/PurchaseItem/', { ItemID: itemID }, () => {
					location.reload();
				});
			});
		})
	}
}
