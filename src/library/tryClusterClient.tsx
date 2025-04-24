import { $ezh, Com } from 'ezh'
import { KeyObj, loading, Model, ModelCtor } from 'ezh-model'
import { CommonError, createNumPkgTypeClient } from 'justrun-ws'
import { User } from './model/User'
import { BorrowBooksRequest } from './package/BorrowBooks'
import { FillBooksRequest } from './package/FillBooks'
import { QueryBooksRequest } from './package/QueryBooks'
import { QueryUserRequest } from './package/QueryUser'
import { ReturnBooksRequest } from './package/ReturnBooks'
import { createModelLoader } from './createModelLoader'

const userId = 'user_1'
const connStr = 'ws://127.0.0.1:8088/api'
const client = createNumPkgTypeClient(() => connStr)
client.enableAuthenticate(0xff00, () => undefined, true)
client.registerError(0x03, CommonError)

client.registerRequest(0x05, QueryUserRequest)
client.registerRequest(0x06, FillBooksRequest)
client.registerRequest(0x07, QueryBooksRequest)
client.registerRequest(0x08, BorrowBooksRequest)
client.registerRequest(0x09, ReturnBooksRequest)

const modelLoader = createModelLoader(client, 0x01, 0x02)

const loadModel = <ModelT extends Model<ModelT>>(
    modelCtor: ModelCtor<ModelT>,
    keyObj: KeyObj<ModelT>,
    cacheOld = true,
): ModelT | undefined => {
    return modelLoader.load(modelCtor, keyObj, cacheOld)
}

const borrowBook = (userId: string, libraryId: string, bookId: string): void => {
    client.sendRequest(new BorrowBooksRequest({
        cid: userId,
        library: libraryId,
        booksToBorrow: [bookId],
    }))
}

const returnBook = (userId: string, libraryId: string): void => {
    client.sendRequest(new ReturnBooksRequest({
        cid: userId,
        library: libraryId,
        bookIndexes: [0],
    }))
}

const BorrowPanel: Com<{ userId: string, libraryId: string, bookId: string }> = ({ userId, libraryId, bookId }) => {
    return <div>
        <input type='button' value='Borrow' onclick={() => borrowBook(userId, libraryId, bookId)} />
        <input type='button' value='Return' onclick={() => returnBook(userId, libraryId)} />
    </div>
}

const UserPanel: Com<{ userId: string }> = ({ userId }) => {
    const user = loadModel(User, { userId })
    if (user) {
        if (user === loading) {
            return <div>
                Loading User ...
            </div>
        }
        return <div>
            <p>id: {user.userId}</p>
            <p>isAdmin: {user.isAdmin}</p>
            <p>books: {user.bookList.map((bookId) => bookId).join(', ')}</p>
        </div>
    }
}

const Main: Com = () => {
    return <div>
        <BorrowPanel userId={userId} libraryId='library_1' bookId='book_1' />
        <UserPanel userId={userId} />
    </div>
}

const rootElement = document.getElementById('root')
if (rootElement) {
    $ezh.render(rootElement, Main)
}
