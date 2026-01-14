import { decField, KeyObj, loading, Model, ModelCtor, SameObj, Struct } from 'ezh-model'
import { CommonError, ConnAliveMonitor, createNumPkgTypeClient, JustrunAuthProvider, MessageWrapper, RequestWrapper } from 'justrun-ws'
import { createModelLoader } from 'justrun-loader'
import { CreateGameRequest } from './packages/CreateGame'
import { VisitGameRequest } from './packages/VisitGame'
import { LeaveGameRequest } from './packages/LeaveGame'
import { JoinGameRequest } from './packages/JoinGame'
import { QuitGameRequest } from './packages/QuitGame'
import { StartGameRequest } from './packages/StartGame'
import { BuyCardRequest } from './packages/BuyCard'
import { TakeGemsRequest } from './packages/TakeGems'
import { ReserveCardRequest } from './packages/ReserveCard'

export { loading }

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
    new ConnAliveMonitor(0, 6, 3),
    // new ConnAliveMonitor(10000, 6, 3),
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
wsClient.registerRequest(0x11, TakeGemsRequest)
wsClient.registerRequest(0x12, ReserveCardRequest)

let isRequesting = false

const sendRequest = async <RequestT, ResponseT>(
    request: RequestWrapper<RequestT, ResponseT>,
): Promise<ResponseT | undefined> => {
    if (!isRequesting) {
        isRequesting = true
        return wsClient.sendRequest(request)
            .catch((err) => {
                if (err instanceof CommonError) {
                    throw err
                }
                console.log('error:', err)
                return undefined
            })
            .finally(() => {
                isRequesting = false
            })
    }
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
        loading?: SameObj<ModelT>,
    ): ModelT | undefined {
        return modelLoader.load(modelCtor, keyObj, loading)
    },
    async createGame(playerCount: number) {
        return sendRequest(new CreateGameRequest({
            userId: authState.cid,
            playerCount,
        }))
    },
    async visitGame(gameCode: string) {
        return sendRequest(new VisitGameRequest({
            userId: authState.cid,
            gameCode,
        }))
    },
    async leaveGame(gameId: string) {
        return sendRequest(new LeaveGameRequest({
            userId: authState.cid,
            gameId,
        }))
    },
    async joinGame(gameId: string, playerName: string) {
        return sendRequest(new JoinGameRequest({
            userId: authState.cid,
            gameId,
            playerName,
        }))
    },
    async quitGame(gameId: string) {
        return sendRequest(new QuitGameRequest({
            userId: authState.cid,
            gameId,
        }))
    },
    async startGame(gameId: string) {
        return sendRequest(new StartGameRequest({
            userId: authState.cid,
            gameId,
        }))
    },
    async takeGems(gameId: string, taking: number[], returning: number[]) {
        return sendRequest(new TakeGemsRequest({
            userId: authState.cid,
            gameId,
            taking,
            returning,
        }))
    },
    async buyCard(gameId: string, cardId: string, payGems: number[][]) {
        return sendRequest(new BuyCardRequest({
            userId: authState.cid,
            gameId,
            cardId,
            payGems,
        }))
    },
    async reserveCard(gameId: string, cardId: string) {
        return sendRequest(new ReserveCardRequest({
            userId: authState.cid,
            gameId,
            cardId,
        }))
    },
}
