import { JsonRequest } from '../defPackage'

export type VisitGameReq = {
    userId: string
    gameCode: number
}

export type VisitGameResp = {
    gameId: string
}

export class VisitGameRequest extends JsonRequest<VisitGameReq, VisitGameResp> { }
