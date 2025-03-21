import { $ezh, Com } from 'ezh'
import { decField, decKey, Model, ModelRepo } from 'ezh-model'

// import { decField, decKey, Model, ModelRepo } from 'ezh-model'

class User extends Model<User> {
    @decKey
    declare readonly id: string

    @decField
    declare name: string

    @decField
    declare age: number
}

class Book extends Model<Book> {
    @decKey
    declare readonly id: number

    @decField
    declare name: string

    @decField
    declare author: string
}

const repo = new ModelRepo()

repo.set(User, {
    id: 'Sam',
    name: 'Sam',
    age: 18,
})

repo.set(User, {
    id: 'Lucy',
    name: 'Lucy',
    age: 17,
})

repo.set(User, {
    id: 'Grace',
    name: 'Grace',
    age: 18,
})

repo.set(Book, {
    id: 1,
    name: 'Book 1',
    author: 'Grace',
})

const Test: Com<{ userId: string, bookId: number }> = ({ userId, bookId }) => {
    const user = repo.get(User, { id: userId })
    const book = repo.get(Book, { id: bookId })
    if (user) {
        return <div
            style={{ background: 'green' }}
            onclick={() => {
                user.age--
                if (book) {
                    book.author += ' ...hahaha'
                }
            }}>
            <p>.</p>
            <p>{`Name is ${user.name}`}</p>
            <p>{`Age is ${user.age}`}</p>
            {book && <p>{`Book name is ${book.name}`}</p>}
            {book && <p>{`Book author is ${book.author}`}</p>}
            <p>.</p>
        </div>
    }
}

const rootElement = document.getElementById('root')
if (rootElement) {
    $ezh.render(rootElement, () => {
        return <div>
            <Test userId='Sam' bookId={1} />
            <Test userId='Lucy' bookId={2} />
            <Test userId='Grace' bookId={1} />
        </div>
    })
}
