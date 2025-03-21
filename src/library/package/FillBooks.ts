import { JsonRequest } from 'justrun-ws'

export type FillBooksReq = {
    cid: string
    library: string
    booksToFill: string[]
}

export type FillBooksResp = {
    filledBooks: number
}

export class FillBooksRequest extends JsonRequest<FillBooksReq, FillBooksResp> { }
