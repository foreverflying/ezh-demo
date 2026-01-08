import { DoneResp, JsonRequest } from '../defPackage'

export type TakeGemsReq = {
    userId: string
    gameId: string
    taking: number[]
    returning: number[]
}

export class TakeGemsRequest extends JsonRequest<TakeGemsReq, DoneResp> { }
