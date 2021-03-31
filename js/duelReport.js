class DuelReport
{
	constructor()
	{
		this.initHighlightPlayerInReport();
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

	initRematch()
	{
		if (!(this.isPlayerInGame() && this.is1on1() && this.isOpponentGladiator())) {
			return;
		}

		const requestRematch = () => {
			$.when(profile.getPlayerDefaultTactics()).then(
				({ tactics, retreatThreshold }) => {
					const opponentID = this.getOpponentID();
					const formData = {
						Tactic: tactics,
						RetreatThreshold: retreatThreshold,
						AcceptTreshold: "100",
						TargetGladiatorID: opponentID
					};

					$.post(
						`/Profile/Challenge/${opponentID}`,
						formData,
						() => {
							location.reload();
						}
					);
				}
			);
		};

		const $rematch = $("<button/>", {
			text: "Utmana igen",
			click: requestRematch,
			css: { float: "right" },
		});

		$('.nav-arrow').after($rematch);
	}
}
