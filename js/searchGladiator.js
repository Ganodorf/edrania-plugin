class SearchGladiator {
	constructor()
	{
		this.initPersistentFilter();

		$('#GladiatorName').focus();
	}

	initPersistentFilter()
	{
		const fieldByName = {
			name: $('#GladiatorName'),
			username: $('#Username'),
			clan: $('#ClanName'),
			race: $('#Race'),
			'min-level': $('#MinimumLevel'),
			'max-level': $('#MaximumLevel'),
			age: $('#Age'),
		};
		const defaultValueByName = {
			name: "",
			username: "",
			clan: "",
			race: "5",
			"min-level": "1",
			"max-level": "99",
			age: "4"
		};

		new PersistentFilter(fieldByName, defaultValueByName);
	}
}
