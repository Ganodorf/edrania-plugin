class TalentCalculator
{
	constructor()
	{
		this.stats = [
			{stat: 'health', text: 'Hälsa'},
			{stat: 'endurance', text: 'Uthållighet'},
			{stat: 'strength', text: 'Styrka'},
			{stat: 'evasion', text: 'Undvika anfall'},
			{stat: 'initiative', text: 'Initiativ'},
			{stat: 'spear', text: 'Spjut'},
			{stat: 'axe', text: 'Yxa'},
			{stat: 'sword', text: 'Svärd'},
			{stat: 'chain', text: 'Kättingvapen'},
			{stat: 'hammer', text: 'Hammare'},
			{stat: 'shield', text: 'Sköld'}
		];

		this.races = [
			'Troll',
			'Ork',
			'Människa',
			'Dvärg',
			'Alv'
		];

		this.attributePointsStart = 150;
		this.attributePointsPerLevel = 20;

		this.openCalculator();
	}

	/**
	 * Open calculator
	 */
	openCalculator()
	{
		const $window = $('<div class="chrome-plugin-talent-calculator">');
		const $menuBar = $('<div class="chrome-plugin-talent-calculator__menu">');

		const $closeBtn = $('<a href="#">Stäng</a>');
		$closeBtn.on('click', () => {
			$window.remove();
			return false;
		});		

		const $menuBtn = $('<a href="#">Meny</a>');
		$menuBtn.on('click', () => {
			this.renderStartMenu();
			return false;
		});

		$menuBar.append($closeBtn);
		$menuBar.append($menuBtn);

		$window.append($menuBar);

		this.main = $('<div class="chrome-plugin-talent-calculator__main">');

		$window.append(this.main);

		$('body').prepend($window);

		this.renderStartMenu();
	}

	/**
	 * Render start menu for calculator
	 */
	renderStartMenu()
	{
		// Add area for creating new spec
		const $div = $('<div>');
		const $input = $('<input class="mr" type="text" name="name" placeholder="Namn på ny">');
		const $select = $('<select class="mr" name="race">');
		const $btn = $('<a class="chrome-plugin-btn" href="#">Skapa ny</a>');

		for (const race of this.races) {
			$select.append('<option>' + race + '</option>');
		}

		$btn.on('click', () => {
			this.createNewSpec($input.val(), $select.val());
		});

		$div.append($input);
		$div.append($select);
		$div.append($btn);

		this.main.html($div);

		// Add existing specs
		const specs = prefillClass.getPrefill('talentCalculatorSpecs');

		const $table = $('<table cellpadding="7" border="1">');
		$table.append('<tr><th>Namn</th><th>Ras</th><th>Redigera</th><th>Radera</th></tr>');

		this.main.append('<h4 class="mt">Dina befintliga</h4>');
		this.main.append($table);
	}

	/**
	 * Render calculator page
	 */
	renderCalculator(spec, currentLevel)
	{
		const race = this.getRaceClass(spec.race);
		if (!race) {
			return;
		}

		this.main.html('<h4>' + spec.name + ' - ' + race.name + '</h4>');

		// Create table
		const $table = $('<table cellpadding="7">');

		for (const stat of this.stats) {
			const $tr = $('<tr>');
			$tr.append('<th>' + stat.text + '</th>');

			const $td = $('<td>');
			const $input = $('<input type="number" name="' + stat.stat + '" value="0">');
			const $span = $('<span class="ml">');

			$td.append($input);
			$td.append($span);

			$input.on('keyup', (event) => {
				const value = round($input.val() * race[stat.stat], 2);
				$span.html(value);
			});

			$input.trigger('keyup');
			
			$tr.append($td);
			$table.append($tr);
		}

		this.main.append($table);
	}

	/**
	 * Get race class
	 */
	getRaceClass(race)
	{
		switch (race) {
			case 'Troll':
				return new Troll();

			case 'Ork':
				return new Orc();

			default:
				alert('Okänd ras!');
				this.renderStartMenu();
				return false;
		}
		
	}

	/**
	 * Creates a new spec
	 */
	createNewSpec(name, race)
	{
		const newSpec = {
			name: name,
			race: race,
			levels: []
		};

		this.renderCalculator(newSpec, 1);
	}
}