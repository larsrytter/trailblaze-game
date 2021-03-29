export default class GameService {
    _baseUrl = 'http://speedroller.larsrytter.dk';

    async startGame(trackId) {
        let gameGuid = null;
        const url = `${this._baseUrl}/api/?action=startgame`;
        const requestOptions = {
            method: "GET",
        };
        const response = await fetch(url, requestOptions);
        if (response.ok) {
            const gameInfo = await response.json();
            gameGuid = gameInfo.guid;
        }
        return gameGuid;
    }

    async finishGame(gameGuid, completedTime) {
        let ranking = null;
        const url = `${this._baseUrl}/api/?action=finishgame&game=${gameGuid}&time=${completedTime}`;
        const requestOptions = {
            method: "GET",
        };
        const response = await fetch(url, requestOptions);
        if (response.ok) {
            const gameInfo = await response.json();
            ranking = gameInfo.ranking;
        }
        return ranking;
    }
}