import { JsonMessage, JsonRequest } from 'justrun-ws'

export type VisitReq = {
    cid: string
    key: string
}

export type VisitResp = {
    buff?: Uint8Array
}

export class VisitRequest extends JsonRequest<VisitReq, VisitResp> {
    override encodeResponse(response: VisitResp): Uint8Array {
        return response.buff ?? new Uint8Array(0)
    }

    override decodeResponse(buffer: Uint8Array): VisitResp {
        return {
            buff: buffer.byteLength > 0 ? buffer : undefined,
        }
    }
}

export type RevokeMsg = {
    key: string
}

export class RevokeMessage extends JsonMessage<RevokeMsg> { }
