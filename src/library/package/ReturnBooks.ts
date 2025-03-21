import { JsonRequest } from 'justrun-ws'

export type ReturnBooksReq = {
    cid: string
    library: string
    bookIndexes: number[]
}

export type ReturnBooksResp = {
    returnedBooks: string[]
    currentOnHandCount: number
}

export class ReturnBooksRequest extends JsonRequest<ReturnBooksReq, ReturnBooksResp> { }
