class Prefill
{
	/**
	 * Get prefill
	 */
	getPrefill(itemName)
	{
		let prefillData = localStorage.getItem(itemName);

		if (prefillData === null) {
			prefillData = {};
		}
		else {
			prefillData = JSON.parse(prefillData);
		}

		return prefillData;
	}

	/**
	 * Save to local storage
	 */
	savePrefill(itemName, event)
	{
		const $input = $(event.currentTarget);
		let prefillData = this.getPrefill(itemName);
		
		if ($input.is(':checkbox')) {
			prefillData[$input.attr('name')] = $input.is(':checked') ? true : false;
		}
		else {
			prefillData[$input.attr('name')] = $input.val();
		}

		localStorage.setItem(itemName, JSON.stringify(prefillData));
	}

	/**
	 * Prefill inputs from local storage
	 */
	prefillInputs(itemName)
	{
		const prefillData = this.getPrefill(itemName);

		$('input').each(function(){
			let $input = $(this);

			let value = prefillData[$input.attr('name')];
			if (value === undefined) {
				return;
			}

			if ($input.is(':checkbox') && !$input.is('#HideProperties')) {
				if (value) {
					$input.trigger('click');
				}
			}
			else {
				$input.val(value);
			}
		});

		$('select').each(function(){
			let $select = $(this);

			let value = prefillData[$select.attr('name')];
			if (value === undefined) {
				return;
			}

			$select.val(value).trigger('change');
		});
	}
}