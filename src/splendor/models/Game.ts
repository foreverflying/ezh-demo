import { Model, decKey, KeyObj, decField, decArray } from '../defModel'

export class Game extends Model<Game> {
    static override keyObjToKey(key: KeyObj<Game>): string {
        return `${this.name}|${key.gameId}`
    }

    @decKey
    declare readonly gameId: string

    @decField
    declare gameCode: string

    @decField
    declare round: number

    @decField
    declare current: number

    @decArray
    declare players: string[]

    @decField
    declare playerCount: number

    @decArray
    declare nobles: string[]

    @decArray
    declare noblesClaimed: string[]

    @decArray
    declare cards: string[]

    @decArray
    declare gems: number[]

    @decField
    declare winner?: string

    @decField
    declare finishedCount?: number
}

export class GameInfo extends Model<GameInfo> {
    static override keyObjToKey(key: KeyObj<GameInfo>): string {
        return `${this.name}|${key.gameCode}`
    }

    @decKey
    declare readonly gameCode: string

    @decField
    declare gameId: string

    @decField
    declare configId: string

    @decArray
    declare visitors: string[]
}
