
const ReadyStateIcon = Object.freeze({
	Ready: "⚔️",
	NotReady: "🛡️"
});

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
				this.updateViewGame();
			});
		}

		this.updateViewGame();
	}

	/**
	 * Get current game ID
	 * @return {string}
	 */
	getGameID()
	{
		return location.pathname.split('/').pop();
	}

	getToggleReadyStateURL()
	{
		return `/TeamGame/${this.getGameID()}/ToggleReadyState`;
	}

	getPlayerReadyStateElement()
	{
		return $(`a[href="${this.getToggleReadyStateURL()}"]`);
	}

	/**
	 * Check if player is set as ready
	 * @return {boolean}
	 */
	isPlayerReady() 
	{
		return this.isReady(this.getPlayerReadyStateElement().text());
	}

	/**
	 * Check if ready state is set to "Ready"
	 * @return {boolean}
	 */
	isReady(readyState)
	{
		const normalizedReadyState = readyState.replace(/[()]/g, '');
		return ["Redo", "Ready"].some((state) =>
			normalizedReadyState.startsWith(state)
		);
	}

	/**
	 * Enhance team game view
	 */
	updateViewGame()
	{
		this.setPlayerReady();
		this.setPlayersReadyState();
		this.setPlayersHealthColor();
    this.ensureTeamCountIsCorrect();
	}

	/**
	 * Check if ready state has state icon
	 * @return {boolean}
	 */
	hasReadyStateIcon(readyState)
	{
		return Object.values(ReadyStateIcon).some((icon) =>
			readyState.includes(icon)
		);
	}

	/**
	 * Convert ready state to corresponding icon
	 * @return {string}
	 */
	toReadyStateIcon(readyState)
	{
		return this.isReady(readyState)
			? ReadyStateIcon.Ready
			: ReadyStateIcon.NotReady;
	}

	/**
	 * 1. Show "Not ready" instead of nothing
	 * 2. Append state icons for better scanability
	 */
	setPlayersReadyState()
	{
		// Set own state icon
		const $readyState = this.getPlayerReadyStateElement();
		const readyState = $readyState.text();
		if (!this.hasReadyStateIcon(readyState)) {
			$readyState.append(` ${this.toReadyStateIcon(readyState)}`);
		}

		// Enhance the other players' state
		$('span[id^=foreignReadyState]').each((_, element) => {
			const $readyState = $(element);
			const readyState = $readyState.text();
			if (this.hasReadyStateIcon(readyState)) {
				return;
			}

			if (this.isReady(readyState)) {
				$readyState.text(`(Redo ${ReadyStateIcon.Ready})`);
			}
			else {
				$readyState.text(`(Ej redo ${ReadyStateIcon.NotReady})`);
			}
		});
	}

	/**
	 * Check if player is in the game
	 * @return {boolean}
	 */
	isPlayerInGame()
	{
		return this.getPlayerReadyStateElement().length > 0;
	}

	/**
	 * Ensure player is set as ready
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

		if (!this.isPlayerReady()) {
			this.setPlayerReadyRequest = $.get(
				this.getToggleReadyStateURL(),
				() => {
					if (!this.isPlayerReady()) {
						this.getPlayerReadyStateElement().text("Redo");
					}
				}
			).always(() => {
				this.setPlayerReadyRequest = null;
			});
		}
	}

	/**
	 * Update colors on players' health
	 */
	setPlayersHealthColor()
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

	/**
	 * The team count becomes out-of-sync every now and then. If so, fix it.
	 */
	 ensureTeamCountIsCorrect()
	 {
		 $('.teamGameTeamContainer').each(function () {
			const $container = $(this);
			const $count = $container.find('[id^="memberCount"]');
			const count = $container.find('[id^="memberRow"]').length;

			if (count !== parseInteger($count.text())) {
				$count.text(count);
			}
		 });
	 }
}
