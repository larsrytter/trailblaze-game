// @ts-check
export default class TrackDataLoader {
    _basePath = '';

    _trackService;

    constructor(trackService) {
        this._trackService = trackService;
    }

    async listTracks() {
        const trackData = await this._trackService.getAll();
        return trackData;
    }

    async loadTrackData(fileName) {
        console.log('download file', fileName);
        const url = `${this._basePath}${fileName}`;
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