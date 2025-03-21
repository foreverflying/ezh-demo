import { JsonRequest } from 'justrun-ws'

export type QueryUserReq = {
    cid: string
}

export type QueryUserResp = {
    booksOnHand: string[]
}

export class QueryUserRequest extends JsonRequest<QueryUserReq, QueryUserResp> { }
