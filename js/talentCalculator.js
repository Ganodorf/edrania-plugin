class TalentCalculator
{
	constructor()
	{
		this.stats = [
			{stat: 'health', text: 'Hälsa', levelUpInput: 'Stamina'},
			{stat: 'endurance', text: 'Uthållighet', levelUpInput: 'Endurance'},
			{stat: 'strength', text: 'Styrka', levelUpInput: 'Strength'},
			{stat: 'evasion', text: 'Undvika anfall', levelUpInput: 'Dexterity'},
			{stat: 'initiative', text: 'Initiativ', levelUpInput: 'Initiative'},
			{stat: 'tactics', text: 'Taktik', levelUpInput: 'Leadership'},
			{stat: 'spear', text: 'Spjut', levelUpInput: 'Spear'},
			{stat: 'axe', text: 'Yxa', levelUpInput: 'Axe'},
			{stat: 'sword', text: 'Svärd', levelUpInput: 'Sword'},
			{stat: 'chain', text: 'Kättingvapen', levelUpInput: 'Chain'},
			{stat: 'shield', text: 'Sköld', levelUpInput: 'Shield'},
			{stat: 'hammer', text: 'Hammare', levelUpInput: 'Hammer'},
			{stat: 'unarmed', text: 'Holmgång', levelUpInput: 'Unarmed'}
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
		// Do not open multiple windows
		if ($('.chrome-plugin-talent-calculator').length) {
			return;
		}

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

		const $importBtn = $('<a href="#">Importera</a>');
		$importBtn.on('click', () => {
			this.renderImportBuild();
			return false;
		});

		$menuBar.append($closeBtn);
		$menuBar.append($menuBtn);
		$menuBar.append($importBtn);

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
		$table.append('<tr><th>Namn</th><th>Ras</th><th>Använd</th><th>Redigera</th><th>Exportera</th><th>Radera</th></tr>');

		const useBuild = localStorage.getItem('talentCalculatorBuildKey');

		for (const key in builds) {
			const build = builds[key];

			let useBuildChecked = '';
			if (useBuild == key) {
				useBuildChecked = ' checked';
			}

			const $tr = $('<tr>');
			const $use = $('<input type="radio" name="useBuild" value="' + key + '"' + useBuildChecked + '>');
			const $edit = $('<a href="#">Redigera</a>');
			const $export = $('<a href="#">Exportera</a>');
			const $delete = $('<a class="text-error" href="#">Radera</a>');
			const $useTd = $('<td style="text-align: center;">');
			const $editTd = $('<td>');
			const $exportTd = $('<td>');
			const $deleteTd = $('<td>');

			$use.on('change', () => {
				if ($use.is(':checked')) {
					localStorage.setItem('talentCalculatorBuildKey', key);
					this.placeLevelUp();
				}
			});

			$edit.on('click', (event) => {
				event.preventDefault();
				this.renderEditBuild(key);
			});

			$export.on('click', (event) => {
				event.preventDefault();
				this.renderExportBuild(build);
			});

			$delete.on('click', (event) => {
				event.preventDefault();

				if (!confirm('Är du säker?')) {
					return false;
				}

				this.deleteBuild(key);
			});

			$useTd.append($use);
			$editTd.append($edit);
			$exportTd.append($export);
			$deleteTd.append($delete);

			$tr.append(
				'<td>' + build.name + '</td>' +
				'<td>' + build.race + '</td>')
				.append($useTd)
				.append($editTd)
				.append($exportTd)
				.append($deleteTd);

			$table.append($tr);
		}

		this.main.append('<h4 class="mt">Dina befintliga</h4>')
			.append('<p>Om du väljer att använda en build så kommer poängen automatiskt att placeras ut när du går upp i grad.</p>')
			.append($table);
	}

	/**
	 * Render calculator page
	 */
	renderCalculator(build, currentLevel)
	{
		currentLevel = parseInteger(currentLevel);
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

		this.main.append($goBack).append('<br><br>');

		if (currentLevel > 0) {
			const $prevLevel = $('<a class="mr chrome-plugin-talent-btn" href="#">Till grad ' + currentLevel + '</a>');
			$prevLevel.on('click', () => {
				this.renderCalculator(build, (currentLevel - 1));
				return false;
			});

			this.main.append($prevLevel);
		}

		const nextLevel = currentLevel + 2;
		const $nextLevel = $('<a class="chrome-plugin-talent-btn" href="#">Till grad ' + nextLevel + '</a>');
		$nextLevel.on('click', () => {
			const nextLevel = (currentLevel + 1);
			if (build.levels.length === nextLevel) {
				this.addLevelToBuild(build, this.loadedBuildKey);
			}
			this.renderCalculator(build, nextLevel);
			return false;
		});
		this.main.append($nextLevel).append('<br>');

		const $pointsLeft = $('<span>' + maxPoints + '</span>');
		this.main.append($pointsLeft);
		$pointsLeft.after(' kvar att spendera');

		const totalPoints = this.getTotalPoints(build, currentLevel - 1);

		// Create table
		const $table = $('<table cellpadding="7">');
		let pointsLeft = currentLevel == 0 ? this.attributePointsStart : this.attributePointsPerLevel;

		for (const stat of this.stats) {
			const $tr = $('<tr>');
			const statPercent = parseInteger((race[stat.stat] * 100) - 100);
			$tr.append('<th>' + stat.text + '</th><td align="right">' + statPercent + '%</td>');

			let currentPoints = 0;
			if (build.levels[currentLevel] !== undefined) {
				currentPoints = build.levels[currentLevel][stat.stat] || 0;
			}

			pointsLeft -= currentPoints;

			const $td = $('<td>');
			const $input = $('<input class="js-points chrome-plugin-talent-input" type="number" name="' + stat.stat + '" value="' + currentPoints + '" min="0">');
			const $spanTotal = $('<span class="ml">');

			$td.append($input);
			$td.append($spanTotal);

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

				const statTotalPoints = totalPoints[stat.stat] || 0;
				$spanTotal.html(round(statTotalPoints + points * race[stat.stat], 2));
				$pointsLeft.text(pointsLeft);
			})
			.trigger('keyup');

			$tr.append($td);
			$table.append($tr);
		}

		$pointsLeft.text(pointsLeft);

		const $button = $('<a class="chrome-plugin-btn mt" href="#">Spara</a>');
		$button.on('click', () => {
			let level = {};

			$('.js-points').each((key, input) => {
				level[$(input).attr('name')] = parseInteger($(input).val());
			});

			build.levels[currentLevel] = level;
			this.saveBuild(build, this.loadedBuildKey);

			const $span = $('<span class="ml text-success">Sparad</span>');
			$button.after($span);
			$span.fadeOut('slow');
			return false;
		});

		this.main.append($table).append($button);
	}

	/**
	 * Edit a build
	 */
	renderEditBuild(key)
	{
		this.loadedBuildKey = key;
		const build = this.getBuild(key);

		const $levelTable = $('<table cellpadding="7" border="1">');
		$levelTable.append('<tr><th>Grad</th><th>Spenderade poäng</th><th>Redigera</th></tr>');

		for (let key in build.levels) {
			const level = parseInteger(key) + 1;

			let spendedPoints = 0;
			const maxPoints = level === 1 ? this.attributePointsStart : this.attributePointsPerLevel;
			for (const stat of this.stats) {
				spendedPoints += build.levels[key][stat.stat] || 0;
			}

			const $edit = $('<a href="#">Redigera</a>');
			$edit.on('click', (e) => {
				e.preventDefault();
				this.renderCalculator(build, key);
			});

			const $tr = $('<tr>');
			const $td = $('<td>');

			$td.append($edit);
			$tr.append('<td>Grad ' + level + '</td><td>' + spendedPoints + '/' + maxPoints + '</td>').append($td);
			$levelTable.append($tr);
		}

		const $addLevel = $('<a href="#">Lägg till grad</a>')
		$addLevel.on('click', () => {
			this.addLevelToBuild(build, key);
			this.renderEditBuild(key);
			return false;
		});

		const $flex = $('<div style="display: flex;">');
		const $one = $('<div class="mr" style="overflow-y: scroll; max-height: 700px;">');
		const $two = $('<div>');

		const $totalPointsTable = $('<table cellpadding="7" border="1">');
		const totalPoints = this.getTotalPoints(build, (build.levels.length - 1));

		for (const stat of this.stats) {
			const $tr = $('<tr>');
			$tr.append('<th>' + stat.text + '</th>');
			$tr.append('<td>' + round(parseFloat(totalPoints[stat.stat] || 0, 2)) + '</td>');
			$totalPointsTable.append($tr);
		}

		$one.append($levelTable).append($addLevel);
		$two.append($totalPointsTable);
		$flex.append($one).append($two);

		this.main.html('<h4>' + build.name + '</h4>');
		this.main.append($flex);
	}

	/**
	 * Render export build
	 */
	renderExportBuild(build)
	{
		const $copy = $('<a class="chrome-plugin-talent-btn" href="#">Kopiera</a>');
		$copy.on('click', () => {
			$('.chrome-plugin-talent-export').select();
			document.execCommand('copy');
			return false;
		});

		this.main.html('<h4>Exportera ' + build.name + '</h4>');
		this.main.append('<p>Här kan du exportera en build och sedan skicka den till någon annan.<br>Kopiera hela innehållet i textrutan.</p>')
			.append($copy)
			.append('<textarea class="chrome-plugin-talent-export">' + JSON.stringify(build) + '</textarea>');
	}

	/**
	 * Render import build
	 */
	renderImportBuild()
	{
		const $import = $('<a class="chrome-plugin-btn" href="#">Importera</a>');
		$import.on('click', () => {
			try {
				const newBuild = JSON.parse($('.chrome-plugin-talent-export').val());
				this.saveBuild(newBuild, -1);
				const newKey = this.getAllBuilds().length - 1;
				this.renderEditBuild(newKey);
			}
			catch(e) {
				alert('Något gick fel: ' + e.message);
			}

			return false;
		});

		this.main.html('<h4>Importera</h4>');
		this.main.append('<p>Här kan du importera en build som någon annan har skapat om du har fått deras json-sträng.<br>Klistra in den i textrutan nedanför och klickar på importera.</p>')
			.append('<textarea class="chrome-plugin-talent-export"></textarea>')
			.append($import);
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
				totalPoints[stat.stat] += round(level[stat.stat] * race[stat.stat], 2);
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
			points += parseInteger($(this).val());
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
		if (name.length === 0) {
			alert('Du måste ange ett namn.');
			return false;
		}

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

		// Check if talentCalculatorBuildKey should be updated
		let talentCalculatorBuildKey = localStorage.getItem('talentCalculatorBuildKey');
		if (talentCalculatorBuildKey == key) {
			localStorage.removeItem('talentCalculatorBuildKey');
		}
		else if (talentCalculatorBuildKey > key) {
			talentCalculatorBuildKey--;
			localStorage.setItem('talentCalculatorBuildKey', talentCalculatorBuildKey);
		}

		prefillClass.savePrefill('talentCalculatorBuilds', builds);
		this.renderStartMenu();
	}

	/**
	 * Place level up points
	 */
	placeLevelUp()
	{
		const key = localStorage.getItem('talentCalculatorBuildKey');

		if (key === null) {
			return;
		}

		const build = this.getBuild(key);
		let currentLevel = getPlayerLevel() - 1;

		if (isNaN(currentLevel)) {
			currentLevel = 0;
		}

		const level = build.levels[currentLevel] || null;

		if (level === null) {
			return;
		}

		// Place points
		for (const stat of this.stats) {
			const $input = $('#' + stat.levelUpInput);
			if (!$input.length) {
				continue;
			}

			const points = level[stat.stat];

			$input.val(points);

			$input[0].dispatchEvent(new Event('change'));
			$input[0].dispatchEvent(new Event('keyup'));
		}
	}
}
