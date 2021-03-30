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
				` (${Math.floor(parseInteger($option.text()) * 0.28)} sm)`
			);
		})
	}
}
