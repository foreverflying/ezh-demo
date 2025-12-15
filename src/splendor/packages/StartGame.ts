import { DoneResp, JsonRequest } from '../defPackage'

export type StartGameReq = {
    userId: string
    gameId: string
}

export class StartGameRequest extends JsonRequest<StartGameReq, DoneResp> { }
