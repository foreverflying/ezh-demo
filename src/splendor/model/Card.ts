import { Model, decKey, KeyObj, decField } from '../defModel'
import { GemType } from './common'

export class Card extends Model<Card> {
    static override keyObjToKey(key: KeyObj<Card>): string {
        return `${this.name}|${key.cardId}`
    }

    @decKey
    declare readonly cardId: string

    @decField
    declare category: number

    @decField
    declare cost: number[]

    @decField
    declare score: number

    @decField
    declare deduct: number
}
