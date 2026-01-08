import { DoneResp, JsonRequest } from '../defPackage'

export type BuyCardReq = {
    userId: string
    gameId: string
    cardId: string
    payGems: number[][]
}

export class BuyCardRequest extends JsonRequest<BuyCardReq, DoneResp> { }
