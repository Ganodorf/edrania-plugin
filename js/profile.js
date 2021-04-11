class Profile {
	constructor()
	{
		this.cache = {
			defaultTactics: null
		};
	}

	/**
	 * Get player's default tactics
	 * @async
	 * @return {$.Deferred}
	 */
	getPlayerDefaultTactics() 
	{
		if (this.cache.defaultTactics !== null) {
			return $.when(this.cache.defaultTactics);
		}

		return $.get("/MyGlad/Profile").then((html) => {
			const $profile = $(html);
			const $tactics = $profile.find("#Tactic");
			const tacticsValue = $tactics.val();
			const tactics = {
				label: $tactics.find(`option[value="${tacticsValue}"]`).text(),
				value: tacticsValue
			};
			const $retreatThreshold = $profile.find("#RetreatThreshold");
			const retreatThresholdValue = $retreatThreshold.val();
			const retreatThreshold = {
				label: $retreatThreshold
					.find(`option[value="${retreatThresholdValue}"]`)
					.text(),
				value: retreatThresholdValue
			};

			return this.cache.defaultTactics = { tactics, retreatThreshold };
		});
	}
}
