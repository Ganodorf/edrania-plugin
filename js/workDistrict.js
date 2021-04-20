class WorkDistrict
{
	constructor()
	{
		this.displaySalaryPerShift();
		this.initDefaultSelectedRounds();
		this.initDuelFriendlyJobs();

		$('#Time').focus();
	}

	displaySalaryPerShift()
	{
		$('#Time option').each(function () {
			const $option = $(this);
			$option.append(
				` (${Math.floor(parseInteger($option.text()) * 0.28)} sm)`
			);
		})
	}

	initDefaultSelectedRounds()
	{
		if (!edraniaConfig.workshopSetDefaultRounds) {
			return;
		}

		const playerRounds = getPlayerTime();

		if (playerRounds >= edraniaConfig.workshopDefaultRounds) {
			$('#Time').val(edraniaConfig.workshopDefaultRounds);
		}
	}

	initDuelFriendlyJobs()
	{
		if (!edraniaConfig.workshopDuelFriendlyJobs) {
			return;
		}

		const playerRounds = getPlayerTime();
		const $rounds = $('#Time');
		const $selectedOption = $rounds.find('option:selected');
		const selectedIndex = $selectedOption.index();

		if (playerRounds === parseInteger($selectedOption.val())) {
			const $newOption = $rounds.find(
				`option:eq(${Math.max(selectedIndex - 1, 0)})`
			);
			$rounds.val($newOption.val());
		}

		const $useUpAllRoundsWarning = $('<p>', {
			html: '<strong>OBS!</strong> Jobbet kommer förbruka <em>alla</em> dina rundor.',
			class: 'text-error',
			css: {display: 'none', marginTop: '0.25rem'}
		});

		$rounds.after($useUpAllRoundsWarning);
		$useUpAllRoundsWarning.toggle($rounds.val() === playerRounds);

		$rounds.on('change', () => {
			$useUpAllRoundsWarning.toggle($rounds.val() === playerRounds);
		});
	}
}
