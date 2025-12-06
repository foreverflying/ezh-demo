import { Model, decKey, KeyObj, decField } from 'ezh-model'

export class GameConfig extends Model<GameConfig> {
    static override keyObjToKey(key: KeyObj<GameConfig>): string {
        return `${this.name}|${key.configId}`
    }

    @decKey
    declare readonly configId: string

    @decField
    declare cards: string[]

    @decField
    declare gems: number[]

    @decField
    declare nobles: string[]
}
