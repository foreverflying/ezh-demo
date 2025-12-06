import { DoneResp, JsonRequest } from 'justrun-ws'

export type StartGameReq = {
    userId: string
    gameId: string
}

export class StartGameRequest extends JsonRequest<StartGameReq, DoneResp> { }
