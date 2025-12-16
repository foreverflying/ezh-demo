import { DoneResp, JsonRequest } from '../defPackage'

export type BuyCardReq = {
    userId: string
    gameId: string
    cardId: string
    gems: number[]
}

export class BuyCardRequest extends JsonRequest<BuyCardReq, DoneResp> { }
