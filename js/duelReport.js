class DuelReport
{
	constructor()
	{
		this.initHighlightPlayerInReport();
		this.initLinkGladiatorNamesInFooterToProfile();
		this.initRematch();
	}

	getOpponentElement()
	{
		return $('a[href^="/Profile/View"]').filter(function () {
			return $(this).text() !== getPlayerName();
		});
	}

	getOpponentID()
	{
		const profileURL = this.getOpponentElement().attr("href");
		return profileURL && profileURL.split("/").pop();
	}

	isPlayerInGame()
	{
		return (
			$('a[href^="/Profile/View"]').filter(function () {
				return $(this).text() === getPlayerName();
			}).length > 0
		);
	}

	is1on1()
	{
		return (
			$('b:contains("Lag"):first')
				.siblings()
				.filter('a,b:not(:contains("Lag"))').length === 2
		);
	}

	isOpponentGladiator()
	{
		const profileURL = this.getOpponentElement().attr('href');
		return (
			typeof profileURL !== "undefined" &&
			profileURL.startsWith("/Profile/View/")
		);
	}

	initHighlightPlayerInReport()
	{
		if (!edraniaConfig.highlightInDuels) {
			return;
		}

		const name = getPlayerName();
		const css = {
			'font-weight': 'bold'
		};

		if (edraniaConfig.highlightWithColor) {
			css['color'] = edraniaConfig.duelHighlightColor;
		}

		$("#centerContent")
			.find(".duelName, .fat, b")
			.filter(function () {
				return $(this).text() === name;
			})
			.css(css);
	}

	initLinkGladiatorNamesInFooterToProfile()
	{
		$('#centerContent .spoilerFree:last b:not(:first)').each(function () {
			const $b = $(this);
			const $profileLink = $(`a:contains(${$b.text()}):first`).clone();

			if ($profileLink.length > 0) {
				$b.replaceWith($profileLink);
			}
		});

		hoverInfo.initHover();
	}

	initRematch()
	{
		if (!(this.isPlayerInGame() && this.is1on1() && this.isOpponentGladiator())) {
			return;
		}

		const opponentID = this.getOpponentID();

		const $rematch = $('<a/>', {
			text: "Utmana igen",
			href: `/Profile/Challenge/${opponentID}`,
			click: function (event) {
				if (!event.altKey) {
					return;
				}

				event.preventDefault();

				const $link = $(this);
				$link.css({
					pointerEvents: 'none',
					width: $link.outerWidth(),
					textAlign: 'center'
				});

				challenge
					.challengeWithDefaultTactics(opponentID)
					.then(() => {
						$link.text('Utmanad!');
					});
			},
			class: 'fat',
			css: {float: 'right'},
		});

		$('.nav-arrow').after($rematch);

		profile.getPlayerDefaultTactics().then(
			({ tactics, retreatThreshold }) => {
				$rematch.attr('title',
					`${tactics.label}, ${retreatThreshold.label}`
				);
			});
	}
}
