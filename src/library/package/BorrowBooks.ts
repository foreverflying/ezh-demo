import { JsonRequest } from 'justrun-ws'

export type BorrowBooksReq = {
    cid: string
    library: string
    booksToBorrow: string[]
}

export type BorrowBooksResp = {
    borrowedBooks: string[]
    currentOnHandCount: number
}

export class BorrowBooksRequest extends JsonRequest<BorrowBooksReq, BorrowBooksResp> { }
