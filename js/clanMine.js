class ClanMine
{
	constructor()
	{
		this.initDefaultRounds();
		$('#TimeToCommit').focus();
	}

	initDefaultRounds()
	{
		const playerRounds = getPlayerTime();
		const [roundsWorked, roundsTotal] = $('.clanBuildingCommitSection').text().replace(/[^\d\/]/g, '').split('/');
		const roundsLeft = parseInteger(roundsTotal) - parseInteger(roundsWorked);

		const workRounds = Math.max(Math.min(playerRounds - 1, roundsLeft), 0);
		const maxRounds = Math.min(playerRounds, roundsLeft);

		$('#TimeToCommit')
			.attr('max', maxRounds)
			.val(workRounds);
	}
}
