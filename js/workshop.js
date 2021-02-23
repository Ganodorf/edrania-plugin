class Workshop
{
	constructor(action)
	{
		switch (action) {
			case 'list':
				this.initList();
				break;

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

	/**
	 * List of projects
	 */
	initList()
	{
		const playerRounds = getPlayerTime();

		$('.compact-table thead th:nth(1)').after('<th>Jobba</th>');

		// Add inputs to work directly from list
		$('.table-body-border:first tr').each((key, tr) => {
			// Check how many rounds are left to complete
			const roundsLeftArr = $(tr).find('td:nth(2)').text().replace(/[\sa-z]/g, '').split('/');
			const roundsLeft = parseInt(roundsLeftArr[1]) - parseInt(roundsLeftArr[0]);

			let workRounds = playerRounds;
			if (roundsLeft < workRounds) {
				workRounds = roundsLeft;
			}

			const $td = $('<td>');
			const $input = $('<input type="number" value="' + workRounds + '" max="' + workRounds + '" min="0" style="width: 60px; margin-right: 5px;">');
			const $workBtn = $('<a href="#">Jobba</a>');

			const workID = $(tr).find('td:nth(4) a').attr('href').replace(/[\D]/g, '');

			$workBtn.on('click', () => {
				const data = {
					ID: workID,
					RoundsToCommit: $input.val()
				};

				if (data.RoundsToCommit == 0) {
					return false;
				}

				$.post('/Workshop/Work/', data, () => {
					location.reload();
				});

				return false;
			});

			$td.append($input).append($workBtn);

			$(tr).find('td:nth(1)').after($td);
		});
	}
}
