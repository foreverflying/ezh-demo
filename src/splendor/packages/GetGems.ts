import { DoneResp, JsonRequest } from '../defPackage'

export type GetGemsReq = {
    userId: string
    gameId: string
    gems: number[]
}

export class GetGemsRequest extends JsonRequest<GetGemsReq, DoneResp> { }
