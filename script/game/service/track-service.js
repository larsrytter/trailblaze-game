export default class TrackService {
    async getAll() {
        let tracks = [];
        const url = `/api/?action=list`;
        const requestOptions = {
            method: "GET",
        };
        const response = await fetch(url, requestOptions);
        if (response.ok) {
            tracks = await response.json();
        }

        return tracks;
    }
}
// [{"id":"1","guid":"e5e2fa5c-bc1b-43ac-ba73-b411cb43e9a8","name":"Something","file":"something_track.json","sortorder":"1"}]