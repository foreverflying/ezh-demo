import { DoneResp, JsonRequest } from 'justrun-ws'

export type QuitGameReq = {
    userId: string
    gameId: string
}

export class QuitGameRequest extends JsonRequest<QuitGameReq, DoneResp> { }
