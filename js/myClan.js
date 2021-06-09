class MyClan
{
	constructor()
	{
		this.initReplaceWorkDistrictWithMine();
	}

	initReplaceWorkDistrictWithMine()
	{
		if (!edraniaConfig.replaceWorkDistrictWithMine) {
			return;
		}

		this.getMineUrl().then(this.replaceWorkDistrictWithMine);

		chrome.storage.onChanged.addListener((changes, namespace) => {
			if (namespace !== 'sync' || !('edraniaCache' in changes)) {
				return;
			}

			const {newValue} = changes.edraniaCache;

			if (newValue && newValue.mineUrl) {
				this.replaceWorkDistrictWithMine(newValue.mineUrl);
			}
		});
	}

	getMineUrl()
	{
		const deferred = $.Deferred();

		chrome.storage.sync.get('edraniaCache', ({edraniaCache = {}}) => {
			// stale while revalidate
			if (typeof edraniaCache.mineUrl !== 'undefined') {
				deferred.resolve(edraniaCache.mineUrl);
			}

			profile.getClanUrl().then(clanUrl => {
				if (clanUrl === null) {
					delete edraniaCache.mineUrl;
					chrome.storage.sync.set({edraniaCache});
					deferred.reject();
					return;
				}

				$.get(`${clanUrl}/Buildings`).then(buildings => {
					const mineUrl = $(buildings)
						.find('#centerContent table')
						.find('tr:contains("Gruva"), tr:contains("Mine")')
						.find('td:nth(4) a')
						.attr('href');

					if (
						/^\/Clan\/\d+\/Buildings\/\d+$/.test(mineUrl) && 
						mineUrl !== edraniaCache.mineUrl
					) {
						chrome.storage.sync.set({edraniaCache: {...edraniaCache, mineUrl}});
						deferred.resolve(mineUrl);
					}
				});
			});
		});

		return deferred.promise();
	}

	replaceWorkDistrictWithMine(mineUrl)
	{
		$('#leftSideBar a[href="/Work"]')
			.attr('href', mineUrl)
			.text('Gruva')
	}
}
