import { decField, KeyObj, Model, ModelCtor, Struct } from 'ezh-model'
import { CommonError, createNumPkgTypeClient, JustrunAuthProvider, MessageWrapper, RequestWrapper, TimeoutMonitor } from 'justrun-ws'
import { createModelLoader } from 'justrun-loader'
import { CreateGameRequest } from './package/CreateGame'
import { VisitGameRequest } from './package/VisitGame'
import { LeaveGameRequest } from './package/LeaveGame'
import { JoinGameRequest } from './package/JoinGame'
import { QuitGameRequest } from './package/QuitGame'
import { StartGameRequest } from './package/StartGame'
import { BuyCardRequest } from './package/BuyCard'
import { GetGemsRequest } from './package/GetGems'
import { ReserveCardRequest } from './package/ReserveCard'

class AuthState extends Struct<AuthState> {
    @decField
    declare cid: string

    @decField
    declare sid: string

    @decField
    declare connErr?: string
}

const authState = new AuthState({ cid: '', sid: '' })
const host = location.host
const authProvider = new JustrunAuthProvider(
    `https://${host}/api/auth`,
    (address, sid) => `wss://${host}/api/ws?sid=${sid}&addr=${address}`,
    (cid, sid, connErr) => {
        authState.cid = cid
        authState.sid = sid
        authState.connErr = connErr
    },
)

const wsClient = createNumPkgTypeClient(
    '',
    new TimeoutMonitor(0, 3, 6),
    // new TimeoutMonitor(2000, 3, 6),
)
wsClient.enableAuthenticate(0xff00, authProvider)
wsClient.registerError(0x03, CommonError)

wsClient.registerRequest(0x05, CreateGameRequest)
wsClient.registerRequest(0x06, VisitGameRequest)
wsClient.registerRequest(0x07, LeaveGameRequest)
wsClient.registerRequest(0x08, JoinGameRequest)
wsClient.registerRequest(0x09, QuitGameRequest)
wsClient.registerRequest(0x0a, StartGameRequest)
wsClient.registerRequest(0x10, BuyCardRequest)
wsClient.registerRequest(0x11, GetGemsRequest)
wsClient.registerRequest(0x12, ReserveCardRequest)

const sendRequest = async <RequestT, ResponseT>(
    request: RequestWrapper<RequestT, ResponseT>,
): Promise<ResponseT | undefined> => {
    return wsClient.sendRequest(request).catch((err) => {
        console.log('error:', err)
        return undefined
    })
}

const sendMessage = <MessageT>(message: MessageWrapper<MessageT>): void => {
    wsClient.sendMessage(message).catch((err) => {
        console.log('error:', err)
    })
}

const modelLoader = createModelLoader(wsClient, 0x01, 0x02)

export const client = {
    get userId() {
        return authState.cid
    },
    get connErr() {
        return authState.connErr
    },
    SignUpAnonymously() {
        return authProvider.authWithCredential('signup', 'Guest', '-', 'anonymous')
    },
    resetAuthState() {
        return authProvider.resetAuthState()
    },
    resetConnState(forceKick: boolean) {
        return authProvider.resetConnState(forceKick)
    },
    loadModel<ModelT extends Model<ModelT>>(
        modelCtor: ModelCtor<ModelT>,
        keyObj: KeyObj<ModelT>,
        cacheOld = true,
    ): ModelT | undefined {
        return modelLoader.load(modelCtor, keyObj, cacheOld)
    },
    async createGame(playerCount: number) {
        const resp = await wsClient.sendRequest(new CreateGameRequest({
            userId: authState.cid,
            playerCount,
        }))
        return resp
    },
    async visitGame(gameCode: number) {
        const resp = await wsClient.sendRequest(new VisitGameRequest({
            userId: authState.cid,
            gameCode,
        }))
        return resp
    },
    async leaveGame(gameId: string) {
        const resp = await wsClient.sendRequest(new LeaveGameRequest({
            userId: authState.cid,
            gameId,
        }))
        return resp
    },
    async joinGame(gameId: string, playerName: string) {
        const resp = await wsClient.sendRequest(new JoinGameRequest({
            userId: authState.cid,
            gameId,
            playerName,
        }))
        return resp
    },
    async quitGame(gameId: string) {
        const resp = await wsClient.sendRequest(new QuitGameRequest({
            userId: authState.cid,
            gameId,
        }))
        return resp
    },
    async startGame(gameId: string) {
        const resp = await wsClient.sendRequest(new StartGameRequest({
            userId: authState.cid,
            gameId,
        }))
        return resp
    },
}
