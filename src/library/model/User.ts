import { Model, decArray, decField, decKey, KeyObj } from 'ezh-model'

export class User extends Model<User> {
    static override keyObjToKey(key: KeyObj<User>): string {
        return `${this.name}|${key.userId}`
    }

    @decKey
    declare readonly userId: string

    @decField
    declare isAdmin: boolean

    @decArray
    declare bookList: string[]
}
