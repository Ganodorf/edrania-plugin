class TeamGame
{
	constructor(action)
	{
		this.setPlayerReadyRequest = null;

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
		$('input, select').on('change', (event) => {prefillClass.savePrefillInputs('teamGamePrefill', event)});
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

							if (parseInteger(levels[0]) > playerLevel || parseInteger(levels[1]) < playerLevel) {
								$tr.hide();
							}
							else {
								$tr.show();
							}
						});

						// Remove superfluous divider, mainly to avoid showing adjacent dividers.
						$('.compact-table:first tbody tr:empty:first').hide();
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
		// Setup observer for changes so we can init hover if anything changes
		for (let i = 0; i < $('.teamGameTeamContainer').length; i++) {
			new EdraniaObserver($('.teamGameTeamContainer')[i], () => {
				hoverInfo.clearCacheTeamGameTeams();
				hoverInfo.initHover();
				this.setPlayerReady();
				this.setPlayerHealthColor();
			});
		}

		this.setPlayerReady();
		this.setPlayerHealthColor();
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
		if (
			!edraniaConfig.teamGameAutoReady ||
			!this.isPlayerInGame() ||
			this.setPlayerReadyRequest !== null
		) {
			return;
		}

		const gameID = location.pathname.split('/')[3];
		const toggleURL = '/TeamGame/' + gameID + '/ToggleReadyState';

		const isPlayerReady = () => {
			const readyState = $('a[href="' + toggleURL + '"]').text();
			return readyState === 'Redo' || readyState === 'Ready';
		}

		if (!isPlayerReady()) {
			this.setPlayerReadyRequest = $.get(toggleURL, () => {
				if (!isPlayerReady()) {
					$('a[href="' + toggleURL + '"]').text("Redo");
				}
			}).always(() => {
				this.setPlayerReadyRequest = null;
			});
		}
	}

	/**
	 * Update colors on players health
	 */
	setPlayerHealthColor()
	{
		$('span[id^="healthIndicator"').each(function(){
			const health = $(this).text();
			if (health === 'Frisk') {
				$(this).css('color', '#008000');
			}
			else if (health === 'Skråmor') {
				$(this).css('color', '#ff9624');
			}
			else {
				$(this).css('color', '#ff0000');
			}
		});
	}
}
