import { Model, decField, decKey, KeyObj } from 'ezh-model'

export class BookStock extends Model<BookStock> {
    static override keyObjToKey(key: KeyObj<BookStock>): string {
        return `${this.name}|${key.stockId}`
    }

    @decKey
    declare readonly stockId: string

    @decField
    declare count: number
}
