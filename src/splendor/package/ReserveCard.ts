import { DoneResp, JsonRequest } from 'justrun-ws'

export type ReserveCardReq = {
    userId: string
    gameId: string
    cardIndex: number
}

export class ReserveCardRequest extends JsonRequest<ReserveCardReq, DoneResp> { }
