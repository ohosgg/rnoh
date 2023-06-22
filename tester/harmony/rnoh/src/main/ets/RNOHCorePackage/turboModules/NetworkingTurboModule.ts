import http from '@ohos.net.http'

import { TurboModule } from "../../RNOH/TurboModule";

interface Query {
    method: string,
    url: string,
    data: Object,
    headers: Object,
    responseType: string,
    incrementalUpdates: boolean,
    timeout: number,
    withCredentials: boolean,
}

export class NetworkingTurboModule extends TurboModule {
    private nextId: number = 0
    private requestMap: Map<number, http.HttpRequest> = new Map();

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

    sendRequest(query: Query, callback: (requestId: number) => void) {
        this.ctx.logger.info(`NetworkingTurboModule::sendRequest(${query})`);
        const requestId = this.createId()

        const onFinish = (status: number, headers: Object,  response: string | Object | ArrayBuffer) => {
            this.sendEvent("didReceiveNetworkResponse", [requestId, status, headers, query.url])
            this.sendEvent("didReceiveNetworkData", [requestId, response])
            this.sendEvent("didCompleteNetworkResponse", [requestId,""])
        }

        const onError = (status: number, headers: Object,  error: string) => {
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
                    this.ctx.logger.info(`NetworkingTurboModule::sendRequest finished ${JSON.stringify(data)}`);
                    onFinish(data.responseCode, {}, data.result);
                } else {
                    this.ctx.logger.info(`NetworkingTurboModule::sendRequest errored ${JSON.stringify(err)}`);
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
        this.ctx.logger.info(`NetworkingTurboModule::abortRequest(${requestId})`);
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
        this.ctx.rnInstance.callRNFunction("RCTDeviceEventEmitter", "emit", [eventName, body])
    }
}