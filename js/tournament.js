class Tournament {
	constructor() 
	{
		this.hoverTimeout;

		this.initLinkPlayedGamesToDuelReport();
	}

	initLinkPlayedGamesToDuelReport() 
	{
		const $playedGames = $('.teamContainer').filter(function () {
			return $(this).find('.win, .lose').length > 0;
		});
		const playerName = getPlayerName();

		const isPlayerInGame = (game, player) => {
			const $game = $(game);

			return $game.has('.my-team-highlight').length > 0
				|| $game
					.find('.team .label')
					.toArray()
					.map(e => $(e).text().trim())
					.includes(player);
		}

		// To make it show ASAP on hover, will be removed when loaded
		$playedGames.attr('title', 'Laddar matchrapport...');

		// Prefetch own games
		$playedGames
			.filter(function () {
				return isPlayerInGame(this, playerName);
			})
			.each((_, game) => {
				this.ensureGameIsLinkedToDuelReport($(game));
			});

		// Lazy load the rest
		$playedGames
			.filter(function () {
				return !isPlayerInGame(this, playerName);
			})
			.on('mouseenter', (event) => {
				this.hoverTimeout = setTimeout(() => {
					this.ensureGameIsLinkedToDuelReport($(event.currentTarget));
				}, 100);
			})
			.on('mouseleave', () => {
				clearTimeout(this.hoverTimeout);
			});
	}

	async ensureGameIsLinkedToDuelReport($game) 
	{
		// Already linked?
		if ($game.children().is('a')) {
			return;
		}

		const $iframe = this.createHiddenIframe(window.location.href);
		$('body').append($iframe);

		const onIframeLoad = () => new Promise(resolve => {
			$iframe.on('load', resolve);
		});

		const [homeTeamId, awayTeamId] =
			$game
				.find('[data-teamid]')
				.map(function () {
					return $(this).data('teamid');
				}).get();

		await onIframeLoad();

		$iframe
			.contents()
			.find('.teamContainer')
			.filter(function () {
				const $teamContainer = $(this);

				return $teamContainer.find(`[data-teamid="${homeTeamId}"`).length > 0
					&& $teamContainer.find(`[data-teamid="${awayTeamId}"`).length > 0
			})
			.click();

		await onIframeLoad();

		const duelReportUrl = $iframe[0].contentWindow.location.href;

		$game
			.wrapInner($('<a>', {
				href: duelReportUrl,
				click: (event) => {
					event.stopPropagation();
				}
			}))
			.removeAttr('title');

		$iframe.remove();
	}

	createHiddenIframe(url) 
	{
		return $('<iframe>', {
			src: url,
			css: {
				position: 'absolute',
				height: 0,
				width: 0,
				border: 0
			}
		});
	}
}
