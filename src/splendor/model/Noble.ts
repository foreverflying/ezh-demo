import { Model, decKey, KeyObj, decField } from '../defModel'

export class Noble extends Model<Noble> {
    static override keyObjToKey(key: KeyObj<Noble>): string {
        return `${this.name}|${key.nobleId}`
    }

    @decKey
    declare readonly nobleId: string

    @decField
    declare score: number

    @decField
    declare criteria: number[]
}
