class Challenge
{
	constructor()
	{
		this.initQuickChallenge();
	}

	challengeWithDefaultTactics(gladiatorID)
	{
		return profile.getPlayerDefaultTactics().then(
			({ tactics, retreatThreshold }) => {
				const formData = {
					Tactic: tactics.value,
					RetreatThreshold: retreatThreshold.value,
					AcceptTreshold: "100",
					TargetGladiatorID: gladiatorID
				};

				return $.post(`/Profile/Challenge/${gladiatorID}`, formData);
			}
		);
	}

	challengeSucceeded($opponent)
	{
		const $successText = $('<b>', {
			class: 'text-success',
			text: 'Utmanad!',
			css: {
				display: 'inline-block',
				minWidth: $opponent.outerWidth(),
				textAlign: 'center'
			}
		});
		$opponent.hide().after($successText);
		$successText.fadeOut(1000, () => {
			$successText.remove();
			$opponent.show();
		});
	}

	initQuickChallenge()
	{
		// Quick challenge using default tactics
		$('a[href^="/Profile/View/"]').on('click', (event) => {
			if (event.altKey) {
				event.preventDefault();

				const $opponent = $(event.target);
				const opponentID = $opponent.attr('href').split('/').pop();
				this.challengeWithDefaultTactics(opponentID).then(() => {
					this.challengeSucceeded($opponent);
				});
			}
		})
	}
}
