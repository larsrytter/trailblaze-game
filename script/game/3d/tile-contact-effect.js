export const EffectTypeEnum = {
    'TURBO' : 'TURBO',
    'SLOW' : 'SLOW',
    'JUMP' : 'JUMP',
    'INVERTCONTROLS': 'INVERTCONTROLS',
    'NONE': 'NONE',
    'HOLE': 'HOLE'
}

export class TileContactEffect {
    _effectType;

    /**
     * Contructor
     * @param {EffectTypeEnum} effectType 
     */
    constructor(effectType) {
        this._effectType = effectType;
    }

    /**
     * Get effectType
     * @returns EffectTypeEnum
     */
    get effectType() {
        return this._effectType;
    }
}