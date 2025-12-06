import { Model, decKey, KeyObj, decField } from 'ezh-model'

export class GlobalConfig extends Model<GlobalConfig> {
    static override keyObjToKey(key: KeyObj<GlobalConfig>): string {
        return `${this.name}|${key.id}`
    }

    @decKey
    declare readonly id: string

    @decField
    declare cards: string[]

    @decField
    declare nobles: string[]

    @decField
    declare configs: string[]
}
