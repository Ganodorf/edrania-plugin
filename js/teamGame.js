class TeamGame
{
	constructor(action)
	{
		switch (action) {
			case 'create':
				this.initPrefill();
				break;

			case 'list':
				this.setupFilter();
				this.initPrefill();
				break;

			case 'view':
				this.setupViewGame();
				break;
		}
	}

	initPrefill()
	{
		$('input, select').on('change', (event) => {prefillClass.savePrefill('teamGamePrefill', event)});
		prefillClass.prefillInputs('teamGamePrefill');
	}

	/**
	 * Setup filter for list
	 */
	setupFilter()
	{
		// Add filter for hiding games that are too high or too low level for the player
		const $input = $('<input class="js-list-filter" type="checkbox" name="hideOutOfLevel">');
		$input.on('change', (event) => {this.filterList(event)});

		const $label = $('<label>');
		$label.append($input).append(' Visa bara för din grad');

		$('.compact-table:first').before($label);
	}

	/**
	 * Filter game lsit
	 */
	filterList(event)
	{
		$('.js-list-filter').each(function(){
			let $input = $(this);

			switch ($input.attr('name')) {
				case 'hideOutOfLevel':
					if ($input.is(':checked')) {
						$('.compact-table:first tbody tr').each(function(){
							const $tr = $(this);

							const levels = $tr.find('td:nth(2)').text().split(' - ');
							const playerLevel = getPlayerLevel();

							if (parseInt(levels[0]) > playerLevel || parseInt(levels[1]) < playerLevel) {
								$tr.hide();
							}
							else {
								$tr.show();
							}
						});
					}
					else {
						$('.compact-table:first tbody tr').show();
					}
					break;
			}
		});
	}

	/**
	 * Setup stuff for view game
	 */
	setupViewGame()
	{
		if (!this.isPlayerInGame()) {
			return false;
		}

		// Set auto ready?
		if (edraniaConfig.teamGameAutoReady) {
			this.setPlayerReady();
		}
	}

	/**
	 * Check if player is in the game
	 * @return {bool}
	 */
	isPlayerInGame()
	{
		const gameID = location.pathname.split('/')[3];
		if ($('a[href="/TeamGame/' + gameID + '/ToggleReadyState"]').length > 0) {
			return true;
		}

		return false;
	}

	/**
	 * Check if player is ready and if not set player as ready
	 */
	setPlayerReady()
	{
		const gameID = location.pathname.split('/')[3];
		const toggleURL = '/TeamGame/' + gameID + '/ToggleReadyState';
		const readyState = $('a[href="' + toggleURL + '"]').text();

		if (readyState !== 'Redo' && readyState !== 'Ready') {
			$.get(toggleURL, () => {
				$('a[href="' + toggleURL + '"]').text('Redo');
			});
		}
	}
}