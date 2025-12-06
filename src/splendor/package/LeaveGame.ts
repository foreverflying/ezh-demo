import { DoneResp, JsonRequest } from 'justrun-ws'

export type LeaveGameReq = {
    userId: string
    gameId: string
}

export class LeaveGameRequest extends JsonRequest<LeaveGameReq, DoneResp> { }
