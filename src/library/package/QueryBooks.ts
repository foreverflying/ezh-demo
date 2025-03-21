import { JsonRequest } from 'justrun-ws'

export type QueryBooksReq = {
    cid: string
    library: string
    booksToBorrow: string[]
}

export type QueryBooksResp = {
    availableBooks: { bookId: string, stock: number }[]
}

export class QueryBooksRequest extends JsonRequest<QueryBooksReq, QueryBooksResp> { }
