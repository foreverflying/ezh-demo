import { JsonRequest } from 'justrun-ws'

export type JoinGameReq = {
    userId: string
    gameId: string
    playerName: string
}

export type JoinGameResp = {
    playerId: string
}

export class JoinGameRequest extends JsonRequest<JoinGameReq, JoinGameResp> { }
