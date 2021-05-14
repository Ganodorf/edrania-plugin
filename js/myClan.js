class MyClan
{
	constructor()
	{
		this.initReplaceWorkDistrictWithMine();
	}

	initReplaceWorkDistrictWithMine()
	{
		profile.getClanUrl().then(clanUrl => {
			if (clanUrl !== null && edraniaConfig.replaceWorkDistrictWithMine) {
				this.replaceWorkDistrictWithMine(clanUrl);
			}
		})
	}

	replaceWorkDistrictWithMine(clanUrl)
	{
		$.get(`${clanUrl}/Buildings`).then(buildings => {
			const mineUrl = $(buildings)
				.find('#centerContent table')
				.find('tr:contains("Gruva"), tr:contains("Mine")')
				.find('td:nth(4) a')
				.attr('href');

			$('#leftSideBar a[href="/Work"]')
					.attr('href', mineUrl)
					.text('Gruva')
		});
	}
}
