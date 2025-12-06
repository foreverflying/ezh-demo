import { DoneResp, JsonRequest } from '../defPackage'

export type ReserveCardReq = {
    userId: string
    gameId: string
    cardIndex: number
}

export class ReserveCardRequest extends JsonRequest<ReserveCardReq, DoneResp> { }
