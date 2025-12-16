import { DoneResp, JsonRequest } from '../defPackage'

export type TakeGemsReq = {
    userId: string
    gameId: string
    gems: number[]
}

export class TakeGemsRequest extends JsonRequest<TakeGemsReq, DoneResp> { }
