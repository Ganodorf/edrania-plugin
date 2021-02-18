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
			{stat: 'tactics', text: 'Taktik'},
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

		this.loadedBuildKey = -1;
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
		this.loadedBuildKey = -1;

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
				this.renderEditBuild(key);
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
		currentLevel = parseInt(currentLevel);
		const race = this.getRaceClass(build.race);
		if (!race) {
			return;
		}

		let maxPoints = 0;
		if (currentLevel === 0) {
			maxPoints = this.attributePointsStart;
		}
		else {
			maxPoints = this.attributePointsPerLevel;
		}

		this.main.html('<h4>' + build.name + ' - grad ' + (currentLevel + 1) + '</h4>');

		const $goBack = $('<a href="#">Tillbaka</a>');
		$goBack.on('click', () => {
			this.renderEditBuild(this.loadedBuildKey)
			return false;
		});

		this.main.append($goBack).append('<br>');

		const $pointsLeft = $('<span>' + maxPoints + '</span>');		
		this.main.append($pointsLeft);
		$pointsLeft.after(' kvar att spendera');

		const totalPoints = this.getTotalPoints(build, currentLevel);

		// Create table
		const $table = $('<table cellpadding="7">');

		for (const stat of this.stats) {
			const $tr = $('<tr>');
			$tr.append('<th>' + stat.text + '</th>');

			let currentPoints = 0;
			if (build.levels[currentLevel] !== undefined) {
				currentPoints = build.levels[currentLevel][stat.stat] || 0;
			}			

			const $td = $('<td>');
			const $input = $('<input class="js-points" type="number" name="' + stat.stat + '" value="' + currentPoints + '" min="0">');
			const $span = $('<span class="ml">');

			$td.append($input);
			$td.append($span);

			$input.on('keyup', (event) => {
				let points = $input.val();
				if (points === '') {
					points = 0;
					$input.val(0);
				}

				const spendedPoints = this.getSpendedPoints();

				if (spendedPoints > maxPoints) {
					const diff = spendedPoints - maxPoints;
					points -= diff;
					$input.val(points);
				}

				let pointsLeft = maxPoints - spendedPoints;
				if (pointsLeft < 0) {
					pointsLeft = 0;
				}

				$span.html(round(totalPoints[stat.stat] + points * race[stat.stat], 2));
				$pointsLeft.text(pointsLeft);
			})
			.trigger('keyup');
			
			$tr.append($td);
			$table.append($tr);
		}

		const $button = $('<button class="chrome-plugin-btn">Spara</button>');
		$button.on('click', () => {
			let level = {};

			$('.js-points').each((key, input) => {
				level[$(input).attr('name')] = parseInt($(input).val());
			});

			build.levels[currentLevel] = level;
			this.saveBuild(build, this.loadedBuildKey);

			const $span = $('<span>Sparad</span>');
			$button.after($span);
			$span.fadeOut('slow');
		});

		this.main.append($table).append($button);
	}

	/**
	 * Get total points spent up to a level with race bonus applied
	 */
	getTotalPoints(build, toLevel)
	{
		const race = this.getRaceClass(build.race);
		const totalPoints = {};

		for (let i = 0; i <= toLevel; i++) {
			const level = build.levels[i];

			for (const stat of this.stats) {
				if (totalPoints[stat.stat] === undefined) {
					totalPoints[stat.stat] = 0;
				}

				// Do not add last level
				if (i !== toLevel) {
					totalPoints[stat.stat] += round(level[stat.stat] * race[stat.stat], 2);
				}				
			}
		}

		return totalPoints;
	}

	/**
	 * Get total spended points on current level
	 */
	getSpendedPoints()
	{
		let points = 0;
		$('.js-points').each(function(){
			points += parseInt($(this).val());
		});

		return points;
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

		this.loadedBuildKey = this.getAllBuilds().length - 1;
		this.addLevelToBuild(newBuild, this.loadedBuildKey);

		this.renderCalculator(newBuild, 0);
	}

	/**
	 * Add a new level to the build
	 */
	addLevelToBuild(build, buildKey)
	{
		const level = {};
		for (const stat of this.stats) {
			level[stat.stat] = 0;
		}

		build.levels.push(level);
		this.saveBuild(build, buildKey);
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
	renderEditBuild(key)
	{
		this.loadedBuildKey = key;
		const build = this.getBuild(key);

		const $table = $('<table cellpadding="7" border="1">');
		$table.append('<tr><th>Grad</th><th>Spenderade poäng</th><th>Redigera</th></tr>');

		for (let key in build.levels) {			
			const level = parseInt(key) + 1;

			let spendedPoints = 0;
			const maxPoints = level === 1 ? this.attributePointsStart : this.attributePointsPerLevel;
			for (const stat of this.stats) {
				spendedPoints += build.levels[key][stat.stat];
			}

			const $a = $('<a href="#">Redigera</a>');
			$a.on('click', (e) => {
				e.preventDefault();
				this.renderCalculator(build, key);
			});

			const $tr = $('<tr>');
			const $td = $('<td>');

			$td.append($a);
			$tr.append('<td>Grad ' + level + '</td><td>' + spendedPoints + '/' + maxPoints + '</td>').append($td);
			$table.append($tr);
		}

		const $a = $('<a href="#">Lägg till grad</a>')
		$a.on('click', () => {
			this.addLevelToBuild(build, key);
			this.renderEditBuild(key);
			return false;
		});

		this.main.html('<h4>' + build.name + '</h4>');
		this.main.append($table);
		this.main.append($a);
	}
}