import { DoneResp, JsonRequest } from '../defPackage'

export type QuitGameReq = {
    gameId: string
    userId: string
}

export class QuitGameRequest extends JsonRequest<QuitGameReq, DoneResp> { }
