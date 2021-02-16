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
		// Add area for creating new build
		const $div = $('<div>');
		const $input = $('<input class="mr" type="text" name="name" placeholder="Namn på ny">');
		const $select = $('<select class="mr" name="race">');
		const $btn = $('<a class="chrome-plugin-btn" href="#">Skapa ny</a>');

		for (const race of this.races) {
			$select.append('<option>' + race + '</option>');
		}

		$btn.on('click', (event) => {
			event.preventDefault();
			this.createNewBuild($input.val(), $select.val());
		});

		$div.append($input);
		$div.append($select);
		$div.append($btn);

		this.main.html($div);

		// Add existing builds
		const builds = this.getAllBuilds();

		const $table = $('<table cellpadding="7" border="1">');
		$table.append('<tr><th>Namn</th><th>Ras</th><th>Redigera</th><th>Radera</th></tr>');

		for (const key in builds) {
			const build = builds[key];

			const $tr = $('<tr>');
			const $edit = $('<a href="#">Redigera</a>');
			const $delete = $('<a href="#" style="color: #ff0000;">Radera</a>');
			const $editTd = $('<td>');
			const $deleteTd = $('<td>');

			$edit.on('click', (event) => {
				event.preventDefault();
				this.editBuild(key);
			});

			$delete.on('click', (event) => {
				event.preventDefault();

				if (!confirm('Är du säker?')) {
					return false;
				}

				this.deleteBuild(key);
			});

			$editTd.append($edit);						
			$deleteTd.append($delete);

			$tr.append(
				'<td>' + build.name + '</td>' + 
				'<td>' + build.race + '</td>')
				.append($editTd)
				.append($deleteTd);

			$table.append($tr);
		}

		this.main.append('<h4 class="mt">Dina befintliga</h4>');
		this.main.append($table);
	}

	/**
	 * Render calculator page
	 */
	renderCalculator(build, currentLevel)
	{
		const race = this.getRaceClass(build.race);
		if (!race) {
			return;
		}

		let maxPoints = 0;
		if (currentLevel === 1) {
			maxPoints = this.attributePointsStart;
		}
		else {
			maxPoints = this.attributePointsPerLevel;
		}

		this.main.html('<h4>' + build.name + ' - ' + race.name + '</h4>');

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

		const $button = $('<button class="chrome-plugin-btn">Spara</button>');
		$button.on('click', () => {			
		});

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

			case 'Människa':
				return new Human();

			case 'Dvärg':
				return new Dwarf();

			case 'Alv':
				return new Elf();

			default:
				alert('Okänd ras!');
				this.renderStartMenu();
				return false;
		}
		
	}

	/**
	 * Creates a new build
	 */
	createNewBuild(name, race)
	{
		const newBuild = {
			name: name,
			race: race,
			levels: []
		};

		this.saveBuild(newBuild, -1)

		this.renderCalculator(newBuild, 1);
	}

	/**
	 * Get a list of all builds
	 */
	getAllBuilds()
	{
		let builds = prefillClass.getPrefill('talentCalculatorBuilds');

		if (builds.length === undefined) {
			builds = [];
		}

		return builds;
	}

	/**
	 * Get a build
	 */
	getBuild(key)
	{
		const builds = this.getAllBuilds();
		return builds[key];
	}

	/**
	 * Save build
	 */
	saveBuild(build, key)
	{
		let builds = this.getAllBuilds();

		if (key === -1) {
			// This is a new cpec
			builds.push(build);
		}
		else {
			builds[key] = build;
		}

		prefillClass.savePrefill('talentCalculatorBuilds', builds);
	}

	/**
	 * Deletea build
	 */
	deleteBuild(key)
	{
		let builds = this.getAllBuilds();
		builds.splice(key, 1);

		prefillClass.savePrefill('talentCalculatorBuilds', builds);
		this.renderStartMenu();
	}

	/**
	 * Edit a build
	 */
	editBuild(key)
	{
		const build = this.getBuild(key);
	}
}