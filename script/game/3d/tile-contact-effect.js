export const EffectTypeEnum = {
    'TURBO' : 'TURBO',
    'SLOW' : 'SLOW',
    'JUMP' : 'JUMP',
    'INVERTCONTROL': 'INVERTCONTROL',
    'NONE': 'NONE',
    'HOLE': 'HOLE'
}

export class TileContactEffect {
    _effectType;

    constructor(effectType) {
        this._effectType = effectType;
    }

    get effectType() {
        return this._effectType;
    }
}