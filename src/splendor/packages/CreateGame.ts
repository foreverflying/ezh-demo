import { JsonRequest } from '../defPackage'

export type CreateGameReq = {
    userId: string
    playerCount: number
    configId?: string
}

export type CreateGameResp = {
    gameId: string
}

export class CreateGameRequest extends JsonRequest<CreateGameReq, CreateGameResp> { }
