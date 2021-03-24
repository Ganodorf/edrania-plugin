class WorkDistrict
{
	constructor()
	{
		this.displaySalaryPerShift();
	}

	displaySalaryPerShift()
	{
		$('#Time option').each(function () {
			const $option = $(this);
			$option.append(
				` (${Math.floor(parseInt($option.text(), 10) * 0.28)} sm)`
			);
		})
	}
}
