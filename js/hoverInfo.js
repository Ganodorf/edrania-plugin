const BOX_OFFSET = 10;

class HoverInfo
{
	constructor()
	{
		// Cache info to avoid loading the same content twice
		this.cache = [];
		this.ajaxRequest = null;
		this.playerArsenalRequest = null;
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
			if (this.playerArsenalRequest !== null) {
				this.playerArsenalRequest.abort();
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
		const boxHeight = $box.outerHeight();
		const boxWidth = $box.outerWidth();
		let top = this.mouseY + BOX_OFFSET;
		let left = this.mouseX + BOX_OFFSET;

		// Outside viewport bottom? Flip vertical position.
		if (top + boxHeight > window.innerHeight - BOX_OFFSET) {
			top = this.mouseY - boxHeight - BOX_OFFSET;
		}

		// Too close to the viewport top? Flip again, but ensure inside viewport.
		if (top < BOX_OFFSET) {
			top = this.mouseY - (this.mouseY + boxHeight - window.innerHeight) - BOX_OFFSET;
		}

		// Outside viewport right? Flip horizontal position.
		if (left + boxWidth > window.innerWidth - BOX_OFFSET) {
			left = this.mouseX - boxWidth - BOX_OFFSET;
		}

		// Too close to the viewport left? Flip again, but ensure inside viewport.
		if (left < BOX_OFFSET) {
			left = this.mouseX - (this.mouseX + boxWidth - window.innerWidth) - BOX_OFFSET;
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
		container.find('.nav-arrow, .description, img').remove();

		while (container.find('br:first-child, br:last-child').length > 0) {
			container.find('br:first-child, br:last-child').remove();
		}

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
		
		// Remove empty attributes
		container.find('td').each(function(){
			const $td = $(this);
			if ($td.text() === '0') {
				$td.parents('tr').remove();

				const header = $td.prev().text();
				if (header.startsWith('Taktik') || header.startsWith('Tactics')) {
					container
						.find('h5:contains("Intelligens"), h5:contains("Intelligence")')
						.parents('tr')
						.remove();
				}
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
		const content = this.createArsenalContent(html);

		this.renderBox(content);

		return content;
	}

	/**
	 * Render info about a player
	 */
	renderPlayerInfoBox(arsenalHtml, statisticsHtml, profileHtml)
	{
		// Dead?
		if ($(profileHtml).find('.col-lg-12').children().first().is('h5')) {
			const content = this.createDeadPlayerContent();
			this.renderBox(content);
			return content;
		}

		const hardestHit = this.getHardestHit(statisticsHtml);
		const mostEvasions = $(statisticsHtml).find('.compact-table:nth(2) tbody tr:nth(2) td:nth(1)').text();
		const mostBlocks = $(statisticsHtml).find('.compact-table:nth(2) tbody tr:nth(3) td:nth(1)').text();
		const race = this.getRace(profileHtml);
		const level = this.getLevel(profileHtml);
		const $avatar = $(profileHtml).find('#centerContent img').removeAttr('style');
		const $container = $('<div>', {css: {width: '500px'}});
		const $body = $('<div>', {css: {display: 'flex', justifyContent: 'space-between'}});
		const $main = $('<div>', {css: {display: 'flex', flexDirection: 'column', alignItems: 'flex-start'}});
		const $avatarContainer = $('<div>', {class: 'chrome-plugin-info-box__avatar'});
		const $aside = $('<div>', {css: {display: 'flex', flexDirection: 'column', alignItems: 'center', flexGrow: 1}});

		if (race !== undefined) {
			$main.append(`<div><b>Ras (grad):</b> ${race} (${level})</div><br/>`);
		}

		$main.append(this.createArsenalContent(arsenalHtml));

		$avatarContainer.append(
			$avatar.length > 0
				? $avatar.prop('outerHTML')
				: $('<div>', {class: 'chrome-plugin-info-box__empty-avatar', text: 'Ingen bild'})
		);

		$aside
			.append($avatarContainer)
			.append('<br/>')
			.append(this.createPlayerStatistics({hardestHit, mostBlocks, mostEvasions}));

		// Check if biography contains any plugin text
		const biography = $(profileHtml).find('.indent-1:nth(2)').html();
		const pluginBiography = typeof biography !== "undefined" ? this.extractPluginBiography(biography) : null;
		if (pluginBiography !== null) {
			$aside.append(`<div class="chrome-plugin-info-box__biography">${pluginBiography}</div>`);
		}

		$body
			.append($main)
			.append($aside);

		$container.append($body);

		this.replaceLineBreaksWithSpacer($container);

		const html = $container.prop('outerHTML');

		this.renderBox(html);

		return html;
	}

	/**
	 * Load single player
	 */
	loadPlayer(href, cacheHref)
	{
		this.playerArsenalRequest = $.get(`${href}/Arsenal`);
		this.playerStatisticsRequest = $.get(`${href}/Stats`);
		this.playerProfileRequest = $.get(href);

		$.when(this.playerArsenalRequest, this.playerStatisticsRequest, this.playerProfileRequest).then((a1, a2, a3) => {
			const arsenalHtml = a1[0];
			const statisticsHtml = a2[0];
			const profileHtml = a3[0];

			this.cache[cacheHref ?? href] = this.renderPlayerInfoBox(arsenalHtml, statisticsHtml, profileHtml);
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
			if (teamHref.includes('/Creature/Display')) {
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
			`<table
				<tbody>
					<tr>
						<th>Sammanlagd grad:</th>
						<td class="text-right">${totalTeamLevel}</td>
					</tr>
					<tr>
						<th>Högsta skada i laget:</th> 
						<td class="text-right">${hardestHit}</td>
					</tr>
				</tbody>
			</table>`;

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
		 const hardestHit = contents.length > 0 
			 ? Math.max.apply(Math, contents.map(({statsHtml}) =>
				 this.getHardestHit(statsHtml)
			 ))
			 : 'N/A';
		 const totalTeamLevel = sum(...teamMembers.map(({level}) => level || 0));
		 const statistics = [
			 {label: 'Sammanlagd grad', value: totalTeamLevel},
			 {label: `Högsta skada i laget${hasCreatures ? '*' : ''}` , value: hardestHit}
		 ];

		 const toMetadata = (race, level) => race ? `${race}, ${level}` : level ? level : '⚰️';

		 const memberItems = teamMembers
		 	.map(({name, race, level}) => 
				`<li>
					<a class="fat">${name || "R.I.P."}</a>
					<span style="font-size: 14px">
						(${toMetadata(race, level)})
					</span>
				</li>`
			)
			.join("");
		 const statisticsRows = statistics
			 .map(({label, value}) =>
				 `<tr><th>${label}:</th><td class="text-right">${value}</td></tr>`
			 )
			 .join("");
		 const htmlParts = [
			 `<ul style="padding-left: 25px">
			 	${memberItems}
			 </ul>
			 <table>
			 	<tbody>
			 		${statisticsRows}
				</tbody>
			 </table>`
		 ];

		 if (hasCreatures) {
			 htmlParts.push(
				 '<div class="spacer"></div>',
				 '*<strong>OBS!</strong> Bestar <em>ej</em> inräknade'
			 );
		 }

		 const html = htmlParts.join('\n');

		 this.renderBox(html);

		 return html;
	 }

	 renderCreatureBox(creatureHtml)
	 {
		const $weapons = $(creatureHtml).find('#centerContent table:first');
		const $armor = $(creatureHtml).find('#centerContent table:nth(1)');

		const html = [
			$weapons.prop('outerHTML'),
			'<div class="spacer"></div>',
			$armor.prop('outerHTML')
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

	isMyGladiator(html)
	{
		return $(html).find('h4:contains("Min gladiator"), h4:contains("My gladiator")').length > 0;
	}

	/**
	 * Get player name
	 */
	 getName(html) {
		 if (this.isMyGladiator(html)) {
			 return $(html).find('#centerContent table:first tbody tr:nth(1) td').text();
		 }

		 return $(html).find('#centerContent h3').text();
	}

	/**
	 * Get player race
	 */
	getRace(html) {
		return $(html).find(`#centerContent table:first tbody tr:nth(${this.isMyGladiator(html) ? 5 : 4}) td`).text();
	}

	/**
	 * Get player level
	 */
	 getLevel(html)
	 {
		 return parseInteger($(html).find(`#centerContent table:first tbody tr:nth(${this.isMyGladiator(html) ? 12 : 7}) td`).text());
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

	replaceAccessoriesHeader(html)
	{
		const $header = $('<h5>', {
			css: {fontWeight: 600, marginBottom: 0},
			text: 'Föremål'
		});

		$(html)
			.find('h4:contains("Föremål"), h4:contains("Accessories")')
			.replaceWith($header);

		return $header;
	}

	replaceLineBreaksWithSpacer(html)
	{
		$(html).find('br').replaceWith($('<div>', {class: 'spacer'}));
	}

	createArsenalContent(html)
	{
		if (this.isMyGladiator(html)) {
			const container = $(html).find('.container .row');

			// Remove "Unequip" buttons
			container.find('table tr td:last-of-type').remove();
	
			// Remove padding
			container.find('.col-12').css({padding: 0});
	
			if (container.find('.col-12:nth(2) table').text().trim().length > 0) {
				this.replaceAccessoriesHeader(
					container.find('.col-12:nth(2)').css('marginTop', 0)
				).before('<br>');
			} 
			else {
				container.find('.col-12:nth(2)').remove();
			}

			this.replaceLineBreaksWithSpacer(container);
	
			return container.html();
		}

		const $equipment = $(html).find('#centerContent .col-6:first');
		const $accessories = $(html).find('#centerContent .col-6:last');
		const hasAccessories = $accessories.find('td').length > 0;

		$equipment.children().first().remove();
		this.replaceAccessoriesHeader($accessories);

		const equipment = $equipment.html();
		const accessories = $accessories.html();

		return `
			${equipment}
			${hasAccessories ? `<br/>${accessories}` : ""}
		`;
	}

	createPlayerStatistics({hardestHit, mostEvasions, mostBlocks})
	{
		return `
			<table>
				<tbody>
					<tr>
						<th>Högsta skada:</th>
						<td class="text-right">${hardestHit}</td>
					</tr>
					<tr>
						<th>Mest undvikningar:</th>
						<td class="text-right">${mostEvasions}</td>
					</tr>
					<tr>
						<th>Mest pareringar:</th>
						<td class="text-right">${mostBlocks}</td>
					</tr>
				</tdbody>
			</table>
		`
	}

	extractPluginBiography(biography)
	{
		const regex = /(?<=\[plugin\])[\w\W]*(?=\[\/plugin\])/g;
		const matches = biography.match(regex);

		if (matches !== null) {
			return matches[0].replaceAll(/[<>]*/g, '').substring(0, 200);
		}

		return null;
	}

	createDeadPlayerContent()
	{
		return $('<div>', {
			css: {
				display: 'flex', 
				alignItems: 'center', 
				justifyContent: 'center', 
				fontSize: '1.5rem', 
				fontWeight: 'bold'
			},
			text: '⚰️ R.I.P.'
		}).prop('outerHTML');
	}
}
