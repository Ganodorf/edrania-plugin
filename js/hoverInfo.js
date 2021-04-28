class HoverInfo
{
	constructor()
	{
		// Cache info to avoid loading the same content twice
		this.cache = [];
		this.ajaxRequest = null;
		this.playerItemsRequest = null;
		this.playerStatisticsRequest = null;
		this.playerProfileRequest = null;
		this.creatureRequest = null;
		this.hoverTimeout = null;
		this.teamGameTeamRequests = [];
		this.tournamentTeamRequests = [];

		// Init hover
		this.initHover();
	}

	/**
	 * Init hover listener
	 */
	initHover()
	{
		$('a').off('mouseenter mouseleave mousemove')
		.on('mouseenter', (event) => {
			// Wait 100 ms in case of user is hovering on multiple links in a short time
			this.hoverTimeout = setTimeout(() => {
				this.hover(event);
			}, 100);
		})
		.on('mouseleave', (event) => {
			clearTimeout(this.hoverTimeout);

			if (this.ajaxRequest !== null) {
				this.ajaxRequest.abort();
			}
			if (this.playerItemsRequest !== null) {
				this.playerItemsRequest.abort();
			}
			if (this.playerStatisticsRequest !== null) {
				this.playerStatisticsRequest.abort();
			}
			if (this.playerProfileRequest !== null) {
				this.playerProfileRequest.abort();
			}
			if (this.creatureRequest !== null) {
				this.creatureRequest.abort();
			}

			for (const request of this.teamGameTeamRequests) {
				request.abort();
			}

			for (const request of this.tournamentTeamRequests) {
				request.abort();
			}

			$('.chrome-plugin-info-box').remove();
		})
		.on('mousemove', (event) => {
			// Update position of info box
			this.mouseX = event.clientX;
			this.mouseY = event.clientY;
			this.setBoxPosition();
		});
	}

	/**
	 * Init hover boxes for
	 */
	hover(event)
	{
		this.mouseX = event.clientX;
		this.mouseY = event.clientY;

		const $a = $(event.currentTarget);
		let href = $a.attr('href');

		let type = '';

		// Check if link match weapon
		if (href.search('/Vendor/Display/') > -1 && edraniaConfig.hoverEquipmentActive) {
			type = 'equipment';
		}
		else if (href === '/MyGlad/Profile/Attributes' && edraniaConfig.hoverMyGladiatorActive) {
			type = 'attributes';
		}
		else if (href === '/MyGlad/Profile/Arsenal' && edraniaConfig.hoverMyGladiatorActive) {
			type = 'arsenal';
		}
		else if (/\/Profile\/View\/\d+$/.test(href) && edraniaConfig.hoverPlayerActive) {
			type = 'player';
		}
		else if (/\/Tournament\/Team\/View\/\d+$/.test(href) && edraniaConfig.hoverPlayerActive) {
			type = 'tournament';
		}
		else if (href.search(/\/TeamGame\/[\d]+\/Join/g) > -1 && edraniaConfig.hoverPlayerActive) {
			type = 'teamGameTeam';
		}

		if (type === '') {
			return false;
		}

		if (this.cache[href] !== undefined) {
			this.renderBox(this.cache[href]);
		}
		else if (type === 'player') {
			this.loadPlayer(href);
		}
		else if (type === 'teamGameTeam') {
			this.loadTeamGameTeam($a, href);
		}
		else if (type === 'tournament') {
			this.loadTournamentTeam(href);
		}
		else {
			this.ajaxRequest = $.get(href, (html) => {
				if (type === 'equipment') {
					this.cache[href] = this.renderEquipmentInfoBox(html);
				}
				else if (type === 'attributes') {
					this.cache[href] = this.renderAttributesInfoBox(html);
				}
				else if (type === 'arsenal') {
					this.cache[href] = this.renderArsenalInfoBox(html);
				}
			});
		}
	}

	/**
	 * Render the box
	 */
	renderBox(content)
	{
		const $div = $('<div class="chrome-plugin-info-box">');

		$div.html(content);

		$('body').prepend($div);

		this.setBoxPosition();
	}

	/**
	 * Set position of box
	 */
	setBoxPosition()
	{
		const $box = $('.chrome-plugin-info-box');
		const boxHeight = $box.height();
		const boxWidth = $box.width();
		let top = this.mouseY + 20;
		let left = this.mouseX + 20;

		// Outside viewport bottom? Flip vertical position.
		if (top + boxHeight > window.innerHeight - 20) {
			top = this.mouseY - boxHeight - 20;
		}

		// Too close to the viewport top? Flip again, but ensure inside viewport.
		if (top < 20) {
			top = this.mouseY - (this.mouseY + boxHeight - window.innerHeight) - 20;
		}

		// Outside viewport right? Flip horizontal position.
		if (left + boxWidth > window.innerWidth - 20) {
			left = this.mouseX - boxWidth - 20;
		}

		// Too close to the viewport left? Flip again, but ensure inside viewport.
		if (left < 20) {
			left = this.mouseX - (this.mouseX + boxWidth - window.innerWidth) - 20;
		}

		$box.css({ top, left })
	}

	/**
	 * Render equipment info box
	 */
	renderEquipmentInfoBox(html)
	{
		let container = $(html).find('.container');

		// Remove things we dont want to show
		container.find('.nav-arrow, .description, br:first, br:last, img').remove();
		container = container.html();

		this.renderBox(container);

		return container;
	}

	/**
	 * Render attributes info box
	 */
	renderAttributesInfoBox(html)
	{
		let container = $(html).find('.container');
		// Remove go back link
		container.find('td').each(function(){
			if ($(this).html() === '0') {
				$(this).parents('tr').remove();
			}
		});
		container = container.html();

		this.renderBox(container);

		return container;
	}

	/**
	 * Render arsenal info box
	 */
	renderArsenalInfoBox(html)
	{
		let container = $(html).find('.container .row');

		// Remove "Unequip" buttons
		container.find('table tr td:last-of-type').remove();

		// Remove padding
		container.find('.col-12').css({padding: 0});

		container = container.html();

		this.renderBox(container);

		return container;
	}

	/**
	 * Render info about a player
	 */
	renderPlayerInfoBox(itemsHtml, statisticsHtml, profileHtml)
	{
		const hardestHit = this.getHardestHit(statisticsHtml);
		const mostEvasions = $(statisticsHtml).find('.compact-table:nth(2) tbody tr:nth(2) td:nth(1)').html();
		const mostBlocks = $(statisticsHtml).find('.compact-table:nth(2) tbody tr:nth(3) td:nth(1)').html();
		const race = $(profileHtml).find('.col-lg-12 .container table tbody tr:nth(4) td').html();
		const level = $(profileHtml).find('.col-lg-12 .container table tbody tr:nth(7) td').html();
		const items = $(itemsHtml).find('.indent-2');
		const container = $('<div style="width: 500px;">').append(items);

		container.append(
			'<div><b>Högsta skada:</b> ' + hardestHit + '</div>' +
			'<div><b>Mest undvikningar:</b> ' + mostEvasions + '</div>' +
			'<div><b>Mest pareringar:</b> ' + mostBlocks + '</div>');

		if (race !== undefined) {
			container.prepend(
				'<div><b>Ras:</b> ' + race + ' (grad ' + level + ')</div>');
		}

		// Check if biography contains any plugin text
		const biography = $(profileHtml).find('.indent-1:nth(2)').html();
		if (biography !== undefined) {
			const regex = /(?<=\[plugin\])[\w\W]*(?=\[\/plugin\])/g;
			const matches = biography.match(regex);

			if (matches !== null) {
				const text = matches[0].replaceAll(/[<>]*/g, '').substring(0, 200);
				container.append('<div><b>Info:</b> ' + text + '</div>');
			}
		}

		this.renderBox(container);

		return container;
	}

	/**
	 * Load single player
	 */
	loadPlayer(href, cacheHref)
	{
		this.playerItemsRequest = $.get(`${href}/Arsenal`);
		this.playerStatisticsRequest = $.get(`${href}/Stats`);
		this.playerProfileRequest = $.get(href);

		$.when(this.playerItemsRequest, this.playerStatisticsRequest, this.playerProfileRequest).then((a1, a2, a3) => {
			const itemsHtml = a1[0];
			const statisticsHtml = a2[0];
			const profileHtml = a3[0];

			this.cache[cacheHref ?? href] = this.renderPlayerInfoBox(itemsHtml, statisticsHtml, profileHtml);
		});
	}

	/**
	 * Load creature
	 */
	 loadCreature(href, cacheHref)
	 {
		 this.creatureRequest = $.get(href, (html) => {
			this.cache[cacheHref] = this.renderCreatureBox(html);
		 });
	 }

	/**
	 * Load team game team
	 */
	loadTeamGameTeam($a, href)
	{
		const $ul = $a.parent().find('ul');
		let totalTeamLevel = 0;
		this.teamGameTeamRequests = [];

		$ul.find('li').each((index, element) => {
			const $link = $(element).find('a');

			const playerLevel = parseInteger(
				$link.text().match(/\((?<level>\d+)\)/).groups.level
			);
			totalTeamLevel += Number.isInteger(playerLevel) ? playerLevel : 0;

			const href = $link.attr('href') + '/Stats';
			this.teamGameTeamRequests.push($.get(href));
		});

		$.when(...this.teamGameTeamRequests).then((...results) => {
			this.cache[href] = this.renderTeamGameTeamBox(
				results,
				totalTeamLevel
			);
		});
	}

	/**
	 * Load tournament team
	 */
	 async loadTournamentTeam(href)
	 {
		const $iframe = createHiddenIframe(href);
		$('body').append($iframe);

		const onIframeLoad = () => new Promise(resolve => {
			$iframe.on('load', resolve);
		});

		await onIframeLoad();

		const teamHref = $iframe[0].contentWindow.location.href;

		if (teamHref.endsWith(href)) {
			this.loadTeam($iframe.contents().find('body').html(), href);
		}
		else {
			if (teamHref.contains('/Creature/Display')) {
				this.loadCreature(teamHref, href);
			}
			else {
				this.loadPlayer(teamHref, href);
			}
		}

		 $iframe.remove();
	 }

	 loadTeam(html, href)
	 {
		 const $html = $(html);
		 this.tournamentTeamRequests = [];

		 const creatures = $(html)
			 .find('#centerContent a[href^="/Creature/Display"]')
			 .toArray()
			 .map((link) => {
				 const $link = $(link);

				 return {
					 name: $link.text(),
					 level: parseInteger($link.parent().next().text())
				 }
			 });

		 $html.find('#centerContent a[href^="/Profile/View"]').each((_, link) => {
			 const profileUrl = $(link).attr('href');
			 this.tournamentTeamRequests.push(
				 $.get(profileUrl),
				 $.get(`${profileUrl}/Stats`)
			 );
		 });

		 $.when(...this.tournamentTeamRequests).then((...results) => {
			 const contents = [];

			 for (let i = 0; i < results.length - 1; i += 2) {
				 const [profileHtml] = results[i];
				 const [statsHtml] = results[i + 1];

				 contents.push({profileHtml, statsHtml});
			 }

			 this.cache[href] = this.renderTournamentTeamBox(contents, creatures);
		 })
	 }

	/**
	 * Render team game team
	 */
	renderTeamGameTeamBox(results, totalTeamLevel)
	{
		let hardestHit = 0;

		// 0 is an array if there are more than one member in the team
		if (Array.isArray(results[0])) {
			for (const result of results) {
				const hit = this.getHardestHit(result[0]);

				if (hit > hardestHit) {
					hardestHit = hit;
				}
			}
		}
		else {
			hardestHit = this.getHardestHit(results[0]);
		}

		if (typeof hardestHit === "undefined" || Number.isNaN(hardestHit)) {
			hardestHit = 0;
		}

		const html =
			`<div><b>Sammanlagd grad:</b> ${totalTeamLevel}</div>
			<div><b>Högsta skada i laget:</b> ${hardestHit}</div>`;

		this.renderBox(html);

		return html;
	}

	/**
	 * Render tournament team
	 */
	 renderTournamentTeamBox(contents, creatures)
	 {
		 const hasCreatures = creatures.length > 0;
		 const teamMembers = [
			 ...contents.map(({profileHtml}) => ({
				 name: this.getName(profileHtml),
				 race: this.getRace(profileHtml),
				 level: this.getLevel(profileHtml)
			 })),
			 ...creatures
		 ];
		 const hardestHit = Math.max.apply(Math, contents.map(({statsHtml}) =>
			 this.getHardestHit(statsHtml)
		 ));
		 const totalTeamLevel = sum(...teamMembers.map(({level}) => level));
		 const statistics = [
			 {label: 'Sammanlagd grad', value: totalTeamLevel},
			 {label: `Högsta skada i laget${hasCreatures ? '*' : ''}` , value: hardestHit}
		 ];

		 const toMetadata = (race, level) => 
			 typeof race !== "undefined" ? `${race}, ${level}` : level;

		 const htmlParts = [
			 '<ul style="padding-left: 25px">',
			 ...teamMembers.map(({name, race, level}) => `<li>
				 	<a class="fat">${name}</a>
					<span style="font-size: 14px">
						(${toMetadata(race, level)})
					</span>
				</li>`
			 ),
			 '</ul>',
			 ...statistics.map(({label, value}) => `<div><b>${label}:</b> ${value}</div>`
			 ),
			 
		 ];

		 if (hasCreatures) {
			 htmlParts.push(
				 '<br/>',
				 '* <strong>OBS!</strong> Bestar <em>ej</em> inräknade'
			 );
		 }

		 const html = htmlParts.join('\n');

		 this.renderBox(html);

		 return html;
	 }

	 renderCreatureBox(creatureHtml)
	 {
		const weapons = $(creatureHtml).find('#centerContent table:first').html();
		const armor = $(creatureHtml).find('#centerContent table:second').html();

		const html = [
			weapons,
			'<br/>',
			armor
		].join('\n');
		
		this.renderBox(html);

		return html;
	 }

	/**
	 * Get hardest hit from html
	 */
	getHardestHit(html)
	{
		const hardestHit = parseInteger($(html).find('.compact-table:nth(2) tbody tr:first td:nth(1)').text());
		return Number.isNaN(hardestHit) ? 0 : hardestHit;
	}

	/**
	 * Get player name
	 */
	 getName(html) {
		return $(html).find('#centerContent h3').text();
	}

	/**
	 * Get player race
	 */
	getRace(html) {
		return $(html).find('#centerContent table:first tbody tr:nth(4) td').text();
	}

	/**
	 * Get player level
	 */
	 getLevel(html)
	 {
		 return parseInteger($(html).find('#centerContent table:first tbody tr:nth(7) td').text());
	 }

	/**
	 * Clear cache for team game teams
	 */
	clearCacheTeamGameTeams()
	{
		for (const key in this.cache) {
			if (key.search(/\/TeamGame\/[\d]+\/Join/g) > -1) {
				this.cache[key] = undefined;
			}
		}
	}
}
