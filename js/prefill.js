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
	 * Save input prefill to local storage
	 */
	savePrefillInputs(itemName, event)
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
	 * Save prefill to local storage
	 */
	savePrefill(itemName, data)
	{
		localStorage.setItem(itemName, JSON.stringify(data));
	}

	/**
	 * Prefill inputs from local storage
	 */
	prefillInputs(itemName)
	{
		const prefillData = this.getPrefill(itemName);

		$('select').each(function(){
			let $select = $(this);

			let value = prefillData[$select.attr('name')];
			if (value === undefined) {
				return;
			}

			// Make sure that the value exists in the select
			if ($select.find('option[value="' + value + '"]').length > 0
				|| $select.find('option:contains("' + value + '")').length > 0
			) {
				$select.val(value);
				// trigger('change') does not work beacuse of framework event listeners
				$select[0].dispatchEvent(new Event('change'));
			}
		});

		$('input').each(function(){
			let $input = $(this);

			// Skip hidden inputs
			if ($input.attr('type') === 'hidden') {
				return;
			}

			let value = prefillData[$input.attr('name')];
			if (value === undefined) {
				return;
			}

			if ($input.is(':checkbox') && !$input.is('#HideProperties')) {
				if (value) {
					$input.trigger('click');
					$input[0].dispatchEvent(new Event('change'));
				}
			}
			else {
				$input.val(value);
			}
		});
	}
}
