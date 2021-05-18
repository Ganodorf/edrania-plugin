class ClanStockpile
{
	constructor()
	{
		this.sortSelectsAlphabetically();
	}

	sortSelectsAlphabetically()
	{
		this.sortSelectAlphabetically($('#SelectedOwnedItemId'));
		this.sortSelectAlphabetically($('#SelectedWithdrawalItemId'));
		this.sortSelectAlphabetically($('#SelectedTargetGladiatorId'));
	}

	sortSelectAlphabetically($select)
	{
		const $options = $select.find('option');
		const $selectedOption = $select.find('option:selected');
		const [selectedOption] = $selectedOption;
		const $valueOptions = $options.filter((_, option) => 
			option !== selectedOption
		);
		const options = $valueOptions.map((_, option) => ({
			label: $(option).text(),
			value: option.value
		}));
		const sortedOptions = [...options].sort((a, b) => 
			a.label.toLowerCase().localeCompare(b.label)
		);

		$valueOptions.each((index, option) => {
			const {label, value} = sortedOptions[index];
			$(option).text(label);
			option.value = value;
		});
		$options.prepend($selectedOption);
	}
}
