import { decField, decKey, KeyObj, Model } from '../defModel'

export class GamePlayingCounter extends Model<GamePlayingCounter> {
    static override keyObjToKey(key: KeyObj<GamePlayingCounter>): string {
        return `${this.name}|${key.id}`
    }

    @decKey
    declare readonly id: string

    @decField
    declare playingCount: number
}

export class GameFinishedCounter extends Model<GameFinishedCounter> {
    static override keyObjToKey(key: KeyObj<GameFinishedCounter>): string {
        return `${this.name}|${key.id}`
    }

    @decKey
    declare readonly id: string

    @decField
    declare finishedCount: number
}
