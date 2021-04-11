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

		const $successText = $('<b>', {
			class: 'text-success',
			text: 'Köpt!',
			css: {
				position: 'absolute',
				top: '50%',
				left: '50%',
				transform: 'translate(-50%, -50%)'
			}
		});
		$purchaseButton.parent().css('position', 'relative');
		$purchaseButton.hide().after($successText);
		$successText.fadeOut(1000, () => {
			$successText.remove();
			$purchaseButton.show();
		});
	}
}
