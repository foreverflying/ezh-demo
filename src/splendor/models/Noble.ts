import { Model, decKey, KeyObj, decArray, decField } from '../defModel'

export class Noble extends Model<Noble> {
    static override keyObjToKey(key: KeyObj<Noble>): string {
        return `${this.name}|${key.id}`
    }

    @decKey
    declare readonly id: string

    @decField
    declare score: number

    @decArray
    declare criteria: number[]
}
