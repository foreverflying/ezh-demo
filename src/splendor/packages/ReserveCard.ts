import { DoneResp, JsonRequest } from '../defPackage'

export type ReserveCardReq = {
    userId: string
    gameId: string
    cardId: string
}

export class ReserveCardRequest extends JsonRequest<ReserveCardReq, DoneResp> { }
