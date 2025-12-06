import { Model, decKey, KeyObj, decField } from 'ezh-model'

export class InnerGame extends Model<InnerGame> {
    static override keyObjToKey(key: KeyObj<InnerGame>): string {
        return `${this.name}|${key.gameId}`
    }

    @decKey
    declare readonly gameId: string

    @decField
    declare cardDeck: string[]
}
