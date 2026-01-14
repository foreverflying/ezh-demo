import { Model, decKey, KeyObj, decField, decArray, Struct } from '../defModel'
import { ActionType } from './common'

export class Action extends Struct<Action> {
    @decField
    declare type: ActionType

    @decField
    declare card?: string

    @decField
    declare noble?: string

    @decArray
    declare gemsTaken?: number[]

    @decArray
    declare gemsReturned?: number[]
}

export class Player extends Model<Player> {
    static override keyObjToKey(key: KeyObj<Player>): string {
        return `${this.name}|${key.playerId}`
    }

    @decKey
    declare readonly playerId: string

    @decField
    declare gameId: string

    @decField
    declare userId: string

    @decField
    declare name: string

    @decField
    declare score: number

    @decArray
    declare nobles: string[]

    @decArray
    declare gems: number[]

    @decArray
    declare bonuses: number[]

    @decArray
    declare reserved: string[]

    @decField
    declare lastAction?: Action
}
