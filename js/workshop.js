class Workshop
{
	constructor(action)
	{
		switch (action) {
			case 'new':
				this.initNewProject();
				break;
		}
	}

	/**
	 * New project
	 */
	initNewProject()
	{
		const $totalCost = $('<span></span>');
		$('#selectedProjectTimeToCreate').after('<br><b id="js-total-cost">Total kostnad: </b>');
		$('#js-total-cost').after($totalCost);

		// Add cost of number of rounds
		$('#projectList').on('change', () => {
			if (!$('#projectList').val()) {
				return;
			}

			hoverInfo.initHover();

			const startCost = parseInt($('#selectedProjectPrice').text().replace(/[\D]/g, ''));
			const rounds = parseInt($('#selectedProjectTimeToCreate').text().replace(/[\D]/g, ''));
			const roundCost = parseInt(rounds * 0.28);
			const totalCost = startCost + roundCost;

			$('#selectedProjectTimeToCreate').append(' (' + roundCost + ' mynt)')
			$totalCost.text(totalCost + ' mynt');
		});
	}
}
