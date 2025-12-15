import { Model, decKey, KeyObj, decField, decArray } from '../defModel'
import { CardCategory, GemType } from './common'

export class Card extends Model<Card> {
    static override readonly source = 'config'

    static override keyObjToKey(key: KeyObj<Card>): string {
        return `${this.name}|${key.id}`
    }

    @decKey
    declare readonly id: string

    @decField
    declare category: CardCategory

    @decArray
    declare cost: number[]

    @decField
    declare score: number

    @decField
    declare deduct: GemType

    @decField
    declare extraDeduct?: GemType
}
