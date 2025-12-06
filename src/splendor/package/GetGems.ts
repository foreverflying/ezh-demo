import { DoneResp, JsonRequest } from 'justrun-ws'

export type GetGemsReq = {
    cid: string
    gems: number[]
}

export class GetGemsRequest extends JsonRequest<GetGemsReq, DoneResp> { }
