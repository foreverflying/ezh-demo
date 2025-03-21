import { makeJsonModelWrapper, Model, ModelLoader } from 'ezh-model'
import { JsonMessage, JsonRequest, WsClient } from 'justrun-ws'

type VisitReq = {
    key: string
}

type VisitResp = {
    buff?: Uint8Array
}

class VisitRequest extends JsonRequest<VisitReq, VisitResp> {
    override encodeResponse(response: VisitResp): Uint8Array {
        return response.buff ?? new Uint8Array(0)
    }

    override decodeResponse(buffer: Uint8Array): VisitResp {
        return {
            buff: buffer.byteLength > 0 ? buffer : undefined,
        }
    }
}

type RevokeMsg = {
    key: string
}

class RevokeMessage extends JsonMessage<RevokeMsg> { }

export const createModelLoader = <PkgTypeT extends number | string>(
    client: WsClient<PkgTypeT>,
    loadPkgType: PkgTypeT,
    invalidPkgType: PkgTypeT,
): ModelLoader => {
    Model.setModelWrapperMaker(makeJsonModelWrapper)
    client.registerRequest(loadPkgType, VisitRequest)
    client.registerMessage(invalidPkgType, RevokeMessage)
    const loader = new ModelLoader(async (key: string) => {
        const visitRequest = new VisitRequest({ key })
        try {
            const resp = await client.sendRequest(visitRequest)
            return resp.buff
        } catch {
            return undefined
        }
    })
    client.handleMessageWith(RevokeMessage, (message: RevokeMsg) => {
        loader.invalidate(message.key)
    })
    client.onConnectionStatus((isOpen: boolean, _active: boolean, _err?: Error) => {
        if (!isOpen) {
            loader.invalidateAll()
        }
    })
    return loader
}
