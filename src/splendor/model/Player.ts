import { Model, decKey, KeyObj, decField, decArray } from 'ezh-model'

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

    @decField
    declare noble?: string

    @decArray
    declare gems: number[]

    @decArray
    declare deducts: number[]

    @decArray
    declare reserved: string[]
}
