import { KeyObj, makeJsonModelWrapper, Model, ModelCtor, ModelLoader } from '../ezh-model'
import { BrowserWsNet } from '../justrun-ws'
import { makeNumTypePkgBuff, parseNumTypePkgBuff } from '../justrun-ws'
import { IConn, IMessageHandler, IPkgHandler, IPkgHub, IRequestHandler } from '../justrun-ws'
import { LazyConn } from '../justrun-ws'
import { SimpleMessageHandler } from '../justrun-ws'
import { ErrorWrapperCtor, MessageWrapper, MessageWrapperCtor, RequestWrapper, RequestWrapperCtor } from '../justrun-ws'
import { TimeoutMonitor } from '../justrun-ws'
import { TypedPkgHub, TypedPkgHubOpts } from '../justrun-ws'
import { RevokeMessage, VisitRequest } from './VisitPackage'

export const createNumPkgTypeClient = (connStr: string, timeoutMonitor?: TimeoutMonitor): WsClient<number> => {
    return new WsClient<number>(connStr, {
        responsePkgType: 0,
        makePkgBuff: makeNumTypePkgBuff,
        parsePkgBuff: parseNumTypePkgBuff,
        timeoutMonitor,
    })
}

export class WsClient<PkgTypeT extends number | string> {
    constructor(connStr: string, opts: TypedPkgHubOpts<PkgTypeT>) {
        const net = new BrowserWsNet<IConn<string>>()
        const pkgHub = this._pkgHub = new TypedPkgHub<PkgTypeT, string>(net, opts)
        this._conn = new LazyConn<string>(() => pkgHub.connect(connStr))
        this._originLoadModel = this.loadModel
        pkgHub.onConnOpen = this.onConnOpen.bind(this)
        pkgHub.onConnClose = this.onConnClose.bind(this)
        Model.setModelWrapperMaker(makeJsonModelWrapper)
    }

    registerError<ErrorT>(pkgType: PkgTypeT, wrapperCtor: ErrorWrapperCtor<ErrorT>): void {
        return this._pkgHub.registerError(pkgType, wrapperCtor)
    }

    registerMessage<MessageT>(pkgType: PkgTypeT, wrapperCtor: MessageWrapperCtor<MessageT>): void {
        return this._pkgHub.registerMessage(pkgType, wrapperCtor)
    }

    registerRequest<RequestT, ResponseT>(pkgType: PkgTypeT, wrapperCtor: RequestWrapperCtor<RequestT, ResponseT>): void {
        return this._pkgHub.registerRequest(pkgType, wrapperCtor)
    }

    handleMessageWith<MessageT, WrapperT extends MessageWrapper<MessageT>>(
        handler: IMessageHandler<PkgTypeT, MessageT, WrapperT, string>,
    ): IPkgHandler<PkgTypeT, string> {
        return this._pkgHub.handleMessageWith(handler)
    }

    handleRequestWith<RequestT, ResponseT, WrapperT extends RequestWrapper<RequestT, ResponseT>>(
        handler: IRequestHandler<PkgTypeT, RequestT, ResponseT, WrapperT, string>,
    ): IPkgHandler<PkgTypeT, string> {
        return this._pkgHub.handleRequestWith(handler)
    }

    removeHandler(handler: IPkgHandler<PkgTypeT, string>) {
        return this._pkgHub.removeHandler(handler)
    }

    sendMessage<MessageT>(message: MessageWrapper<MessageT>): Promise<void> {
        return this._conn.sendMessage(message)
    }

    async sendRequest<RequestT, ResponseT>(request: RequestWrapper<RequestT, ResponseT>): Promise<ResponseT> {
        await this._conn.sendRequest(request)
        return request.resp
    }

    enableModelLoader(loadPkgType: PkgTypeT, invalidPkgType: PkgTypeT) {
        const { _originLoadModel, _pkgHub, _conn } = this
        if (this.loadModel === _originLoadModel) {
            _pkgHub.registerRequest(loadPkgType, VisitRequest)
            _pkgHub.registerMessage(invalidPkgType, RevokeMessage)
            _pkgHub.handleMessageWith(
                new SimpleMessageHandler(RevokeMessage, this.handleRevoke.bind(this)),
            )
            const loader = new ModelLoader(async (key: string) => {
                const visitRequest = new VisitRequest({ cid: '', key })
                try {
                    await _conn.sendRequest(visitRequest)
                    return visitRequest.resp.buff
                } catch {
                    return undefined
                }
            })
            this._loader = loader
            this.loadModel = loader.load.bind(loader)
        }
    }

    loadModel<ModelT extends Model<ModelT>>(
        _modelCtor: ModelCtor<ModelT>,
        _keyObj: KeyObj<ModelT>,
        _cacheOld = true,
    ): ModelT | undefined {
        throw new Error('Need to call "enableModelLoader" before using')
    }

    private handleRevoke(_conn: IConn<string>, message: RevokeMessage): void {
        const { _loader } = this
        _loader!.invalidate(message.data.key)
    }

    private onConnOpen(_pkgHub: IPkgHub<string>, conn: IConn<string>, _activeOpen: boolean): void {
        conn.context = ''
    }

    private onConnClose(_pkgHub: IPkgHub<string>, _conn: IConn<string>, activeClose: boolean, err?: Error): void {
        if (!activeClose) {
            this._conn.close(err)
        }
    }

    private _pkgHub: TypedPkgHub<PkgTypeT, string>
    private _conn: LazyConn<string>
    private _loader?: ModelLoader
    private _originLoadModel: typeof this.loadModel
}
