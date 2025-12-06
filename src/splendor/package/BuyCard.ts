import { DoneResp, JsonRequest } from 'justrun-ws'

export type BuyCardReq = {
    userId: string
    gameId: string
    cardIndex: number
    gems: number[]
}

export class BuyCardRequest extends JsonRequest<BuyCardReq, DoneResp> { }
