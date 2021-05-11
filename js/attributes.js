class Attributes
{
	constructor()
	{
		this.initDisplayDerivedDamageBonusFromStrength();
	}

	initDisplayDerivedDamageBonusFromStrength()
	{
		const $strength = $('#centerContent')
			.find('th:contains("Styrka"), #centerContent th:contains("Strength")')
			.next();
		const strength = parseInteger($strength.text());
		const normalDamageBonus = Math.floor(strength * 0.09);
		const title = `${Math.floor(strength * 0.07)}-${Math.floor(strength * 0.11)} skadebonus (lätta-tunga attacker)`;
		
		$strength.append(` (~${normalDamageBonus} skadebonus)`).attr('title', title);
	}
}
