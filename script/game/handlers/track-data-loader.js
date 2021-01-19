export default class TrackDataLoader {
    _basePath = '/script/data';

    async loadTrackData(fileName) {
        const url = `${this._basePath}/${fileName}`;
        let data = {};
        try {
            let response = await fetch(url);
            console.log('leveldata', response);
            data = response.json();
        } catch(ex) {
            console.error('Error fetching leveldata', ex);
        }
        return data;
    }
}