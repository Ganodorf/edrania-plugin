class Profile {
	constructor()
	{
		this.cache = {
			html: null,
			defaultTactics: null,
			clanUrl: null
		};
	}

	getMyProfile()
	{
		return $.get('/MyGlad/Profile');
	}

	getHtml()
	{
		if (this.cache.html !== null) {
			return $.when(this.cache.html);
		}
		
		return this.getMyProfile().then(html => {
			return this.cache.html = html;
		});
	}

	getClanUrl()
	{
		if (this.cache.clanUrl !== null) {
			return this.cache.clanUrl;
		}
		
		return this.getHtml().then(html => {
			const clan = $(html).find('#centerContent table tr:nth(9) td a');
			const clanUrl = clan.attr('href');

			if (clanUrl && clanUrl.length > 0 && clanUrl !== '/Clan/-1') {
				return this.cache.clanUrl = clanUrl;
			}

			return null;
		});
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

		return this.getHtml().then((html) => {
			const $profile = $(html);
			const $tactics = $profile.find('#Tactic');
			const tacticsValue = $tactics.val();
			const tactics = {
				label: $tactics.find(`option[value='${tacticsValue}']`).text(),
				value: tacticsValue
			};
			const $retreatThreshold = $profile.find('#RetreatThreshold');
			const retreatThresholdValue = $retreatThreshold.val();
			const retreatThreshold = {
				label: $retreatThreshold
					.find(`option[value='${retreatThresholdValue}']`)
					.text(),
				value: retreatThresholdValue
			};

			return this.cache.defaultTactics = { tactics, retreatThreshold };
		});
	}
}
