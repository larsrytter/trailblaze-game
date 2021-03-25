export default class TrackList {
    _trackDataLoader;
    _tracks; 

    constructor(trackDataLoader) {
        this._trackDataLoader = trackDataLoader;
    }

    async initialize() {
        this.tracks = await this._trackDataLoader.listTracks();

    }
}