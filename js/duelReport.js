class DuelReport
{
	constructor()
	{
		this.initHighlightPlayerInReport();
		this.initLinkGladiatorNamesInFooterToProfile();
		this.initGladiatorRematch();
		this.initCreatureRematch();
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
			$('b:contains("Lag"):first, b:contains("Team"):first')
				.siblings()
				.filter((_, element) =>
					$(element).is('a') ||
					($(element).is('b') && 
						!['Lag', 'Team'].some(text => text === $(element).text())
					)
				).length === 2
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

	getCreatureOpponentName()
	{
		return $('#centerContent b')
			.filter((_, element) => 
				$(element).text() === 'Lag' || $(element).text() === 'Team'
			)
			.eq(1)
			.nextAll('b:first')
			.text();
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
			const $profileLink = $('#centerContent a')
				.filter(function () {
					return $(this).text() === $b.text();
				})
				.first()
				.clone();

			if ($profileLink.length > 0) {
				$b.replaceWith($profileLink);
			}
		});

		hoverInfo.initHover();
	}

	initGladiatorRematch()
	{
		if (!(this.isPlayerInGame() && this.is1on1() && this.isOpponentGladiator())) {
			return;
		}

		const opponentID = this.getOpponentID();

		const $rematch = $('<a/>', {
			text: "Utmana igen",
			href: `/Profile/Challenge/${opponentID}`,
			on: {
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
			},
			class: 'fat',
			css: {float: 'right'},
		});

		$('.nav-arrow').after($rematch);

		profile.getPlayerDefaultTactics().then(
			({ tactics, retreatThreshold }) => {
				$rematch.attr('title',
					`Håll nere [${this.isMacOs() ? "Option" : "Alt"}] för att utmana direkt med ${tactics.label}, ${retreatThreshold.label}`
				);
			});
	}

	getCreatureUrl(creatureName)
	{
		return $.get('/Creature/List').then(creaturesHtml => {
			return $(creaturesHtml)
				.find('a[href^="/Creature/ScenarioDisplay/"]')
				.filter((_, element) => $(element).text() === creatureName)
				.attr('href');
		});
	}

	initCreatureRematch()
	{
		if (!this.isPlayerInGame() || !this.is1on1() || this.isOpponentGladiator()) {
			return;
		}

		const defaultTacticsDeferred = profile.getPlayerDefaultTactics();
		const creatureName = this.getCreatureOpponentName();

		this.getCreatureUrl(creatureName).then(creatureUrl => {
			const result = /\/Creature\/ScenarioDisplay\/(?<creatureId>\d+)/
				.exec(creatureUrl);
			const {creatureId} = result.groups;

			const $form = $('<form/>', {action: creatureUrl, method: 'post', css: {float: 'right'}});
			const $tactics = $('<input/>', {type: 'hidden', id: 'tactics', name: 'Tactic'});
			const $retreatThreshold = $('<input/>', {type: 'hidden', id: 'retreat-threshold', name: 'RetreatThreshold'});
			const $creatureId = $('<input/>', {type: 'hidden', id: 'creature-id', name: 'ID', value: creatureId});
			const $rematch = $('<a/>', {
				text: "Strid igen",
				href: creatureUrl,
				on: {
					click: function (event) {
						if (!event.altKey) {
							return;
						}

						event.preventDefault();

						defaultTacticsDeferred.then(
							({tactics, retreatThreshold}) => {
								$tactics.val(tactics.value);
								$retreatThreshold.val(retreatThreshold.value);
								$form.submit();
							});
					},
				},
				class: 'fat'
			});

			$form.append($tactics);
			$form.append($retreatThreshold);
			$form.append($creatureId);
			$form.append($rematch);

			$('.nav-arrow').after($form);

			defaultTacticsDeferred.then(
				({tactics, retreatThreshold}) => {
					$rematch.attr('title',
						`Håll nere [${this.isMacOs() ? "Option" : "Alt"}] för att duellera direkt med ${tactics.label}, ${retreatThreshold.label}`
					);
				});
		})
	}

	isMacOs()
	{
		return navigator.platform.toLowerCase().startsWith('mac');
	}
}
