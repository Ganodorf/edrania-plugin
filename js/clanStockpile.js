class ClanStockpile
{
	constructor()
	{
		this.sortSelectsAlphabetically();
		this.addSearchFilterToHistory();

		$('a[href="#tabs-main-2"]').on('click', () => {
			$('#history-search').focus();
		});
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

	addSearchFilterToHistory()
	{
		const $search = $('<input/>', {
			id: 'history-search',
			type: 'search',
			placeholder: 'Sök transaktion',
			css: {
				position: 'sticky',
				top: '-1em',
				left: '5px',
				width: 'calc(100% - 10px)',
				zIndex: 1,
				marginBottom: '1em'
			},
			on: {
				input: (event) => {
					this.filterHistory(event.target.value.toLowerCase());
				}
			}
		});

		$('#tabs-main-2').prepend($search);
	}

	filterHistory(query)
	{
		$('#tabs-main-2 tbody tr').each(function () {
			const $transaction = $(this);
			$transaction.toggle($transaction.text().toLowerCase().includes(query));
		});
	}
}
