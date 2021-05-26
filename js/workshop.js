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
		const $totalCost = $('<span>');
		const $timeToCreate = $('#selectedProjectTimeToCreate');
		$timeToCreate.after('<br><b id="js-total-cost">Total kostnad: </b>');
		$('#js-total-cost').after($totalCost);

		// Add cost of number of rounds and estimated time required
		$('#projectList').on('change', () => {
			if (!$('#projectList').val()) {
				return;
			}

			hoverInfo.initHover();

			const startCost = parseInteger($('#selectedProjectPrice').text().replace(/[\D]/g, ''));
			const rounds = parseInteger($timeToCreate.text().replace(/[\D]/g, ''));
			const roundCost = parseInteger(rounds * 0.28);
			const totalCost = startCost + roundCost;
			const estimatedTime = this.formatSeconds((rounds / 175) * 3600);

			$timeToCreate.append(` (~${estimatedTime})`);
			$totalCost.text(`${totalCost} mynt (${roundCost} mynt för rundorna)`);
		});
	}

	formatSeconds(seconds)
	{
		const hours = Math.floor(seconds / 3600);
		const minutes = Math.floor((seconds % 3600) / 60);
		const parts = [];

		if (hours > 0) {
			parts.push(`${hours}h`);
		}

		if (minutes > 0) {
			parts.push(`${minutes}m`);
		}
	  
		return parts.join(' ');
	}

	/**
	 * List of projects
	 */
	initList()
	{
		// Any onging projects?
		if ($('#centerContent a[href^="/Workshop/WorkItem/Cancel"]').length === 0) {
			return;
		}

		const playerRounds = getPlayerTime();

		$('.compact-table thead th:nth(1)').after('<th>Jobba</th>');

		// Add inputs to work directly from list
		$('.table-body-border:first tr').each((key, tr) => {
			// Check how many rounds are left to complete
			const roundsLeftArr = $(tr).find('td:nth(2)').text().replace(/[\sa-z]/g, '').split('/');
			const roundsLeft = parseInteger(roundsLeftArr[1]) - parseInteger(roundsLeftArr[0]);

			// Rationale: don't use up all available rounds
			const workRounds = Math.max(Math.min(playerRounds - 1, roundsLeft), 0);
			const maxRounds = Math.min(playerRounds, roundsLeft);

			const $td = $('<td>');
			const $input = $('<input type="number" value="' + workRounds + '" max="' + maxRounds + '" min="0" style="width: 60px; margin-right: 5px;">');
			const $workBtn = $('<a href="#" class="fat">Jobba</a>');

			const workID = $(tr).find('td:nth(4) a').attr('href').replace(/[\D]/g, '');

			const work = () => {
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
			};

			$workBtn.on('click', work);
			$input.on('keydown', (event) => {
				if (event.key === "Enter") {
					return work();
				}
			});

			$td.append($input).append($workBtn);

			$(tr).find('td:nth(1)').after($td);
		});

		$('#centerContent a:contains("Jobba"):first').prev().focus();
	}
}
