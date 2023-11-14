import http from '@ohos.net.http'
import util from "@ohos.util";

import { TurboModule } from "../../RNOH/TurboModule";

type ResponseType =
  | 'base64'
  | 'blob'
  | 'text';

interface Query {
  method: string,
  url: string,
  data: Object,
  headers: Object,
  responseType: ResponseType,
  incrementalUpdates: boolean,
  timeout: number,
  withCredentials: boolean,
}

export class NetworkingTurboModule extends TurboModule {
  public static readonly NAME = 'Networking';
  private nextId: number = 0
  private requestMap: Map<number, http.HttpRequest> = new Map();
  private base64Helper: util.Base64Helper = new util.Base64Helper();

  private REQUEST_METHOD_BY_NAME: Record<string, http.RequestMethod> = {
    OPTIONS: http.RequestMethod.OPTIONS,
    GET: http.RequestMethod.GET,
    HEAD: http.RequestMethod.HEAD,
    POST: http.RequestMethod.POST,
    PUT: http.RequestMethod.PUT,
    DELETE: http.RequestMethod.DELETE,
    TRACE: http.RequestMethod.TRACE,
    CONNECT: http.RequestMethod.CONNECT,
  }

  decodeBuffer(buf: ArrayBuffer): string {
    const textDecoder = util.TextDecoder.create();
    const byteArray = new Uint8Array(buf);
    return textDecoder.decodeWithStream(byteArray, {stream: false});
  }

  async encodeResponse(query: Query, response: string | Object | ArrayBuffer): Promise<string | Object> {
    if (query.responseType === 'text') {
      if (typeof response === 'string') {
        return response;
      } else if (response instanceof ArrayBuffer) {
        return this.decodeBuffer(response);
      } else {
        // NOTE: Object responses have been long deprecated in Ark, we don't expect them here
        throw new Error("INTERNAL: unexpected Object http response");
      }
    } else if (query.responseType === 'base64') {
      let byteArray: Uint8Array;
      if (typeof response === 'string') {
        const textEncoder = new util.TextEncoder();
        byteArray = textEncoder.encodeInto(response);
      } else if (response instanceof ArrayBuffer) {
        byteArray = new Uint8Array(response);
      } else {
        throw new Error("INTERNAL: unexpected Object http response");
      }
      return this.base64Helper.encodeToString(byteArray);
    }

    throw new Error("Unsupported query response type");
  }

  sendRequest(query: Query, callback: (requestId: number) => void) {
    const requestId = this.createId()

    const onFinish = async (status: number, headers: Object, response: string | Object | ArrayBuffer) => {
      this.sendEvent("didReceiveNetworkResponse", [requestId, status, headers, query.url])
      const encodedResponse = await this.encodeResponse(query, response);
      this.sendEvent("didReceiveNetworkData", [requestId, encodedResponse])
      this.sendEvent("didCompleteNetworkResponse", [requestId, ""])
    }

    const onError = (status: number, headers: Object, error: string) => {
      this.sendEvent("didReceiveNetworkResponse", [requestId, status, headers, query.url])
      this.sendEvent("didCompleteNetworkResponse", [requestId, error])
    }

    const httpRequest = http.createHttp();
    httpRequest.request(
      query.url,
      {
        method: this.REQUEST_METHOD_BY_NAME[query.method],
        header: query.headers,
        extraData: query.data,
        connectTimeout: query.timeout,
        readTimeout: query.timeout
      },
      (err, data) => {
        if (!err) {
          onFinish(data.responseCode, {}, data.result);
        } else {
          onError(data?.responseCode ?? 0, {}, err.toString());
        }
        httpRequest.destroy();
        this.requestMap.delete(requestId)
      }
    )

    this.requestMap.set(requestId, httpRequest);
    callback(requestId)
  }

  abortRequest(requestId: number) {
    const httpRequest = this.requestMap.get(requestId);
    if (httpRequest) {
      httpRequest.destroy()
      this.requestMap.delete(requestId)
    }
  }

  private createId(): number {
    return this.nextId++
  }

  private sendEvent(eventName: string, body: Object) {
    this.ctx.rnInstanceManager.emitDeviceEvent(eventName, body)
  }
}