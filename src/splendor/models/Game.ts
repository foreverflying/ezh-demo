import { Model, decKey, KeyObj, decField, decArray } from '../defModel'

export class Game extends Model<Game> {
    static override keyObjToKey(key: KeyObj<Game>): string {
        return `${this.name}|${key.gameId}`
    }

    @decKey
    declare readonly gameId: string

    @decField
    declare gameCode: number

    @decField
    declare round: number

    @decField
    declare first: number

    @decField
    declare current: number

    @decArray
    declare players: number[]

    @decField
    declare playerCount: number

    @decArray
    declare nobles: string[]

    @decArray
    declare cards: string[]

    @decArray
    declare gems: number[]
}

export class GameInfo extends Model<GameInfo> {
    static override keyObjToKey(key: KeyObj<GameInfo>): string {
        return `${this.name}|${key.gameCode}`
    }

    @decKey
    declare readonly gameCode: number

    @decField
    declare gameId: string

    @decField
    declare configId: string

    @decArray
    declare visitors: string[]
}
