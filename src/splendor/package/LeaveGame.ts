import { DoneResp, JsonRequest } from '../defPackage'

export type LeaveGameReq = {
    gameId: string
    userId: string
}

export class LeaveGameRequest extends JsonRequest<LeaveGameReq, DoneResp> { }
