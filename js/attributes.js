class Attributes
{
	constructor()
	{
		this.initDisplayDerivedDamageBonusFromStrength();
	}

	initDisplayDerivedDamageBonusFromStrength()
	{
		const $strength = $('#centerContent th:contains("Styrka")').next();
		const strength = parseInteger($strength.text());
		const damageBonus = Math.floor(strength / 10);
		
		$strength.append(` (~${damageBonus} skadebonus)`)
	}
}
