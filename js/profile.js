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
	 * @return {object}
	 */
	getPlayerDefaultTactics() 
	{
		if (this.cache.defaultTactics !== null) {
			return this.cache.defaultTactics;
		}

		return $.get("/MyGlad/Profile").then((html) => {
			const $profile = $(html);
			const tactics = $profile.find("#Tactic").val();
			const retreatThreshold = $profile.find("#RetreatThreshold").val();

			return this.cache.defaultTactics = { tactics, retreatThreshold };
		});
	}
}
