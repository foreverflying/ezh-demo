import { Model, decKey, KeyObj, decField } from 'ezh-model'

export class User extends Model<User> {
    static override keyObjToKey(key: KeyObj<User>): string {
        return `${this.name}|${key.userId}`
    }

    @decKey
    declare readonly userId: string

    @decField
    declare gameId: string

    @decField
    declare playerId?: string
}
