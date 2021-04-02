import { IHttpRequest, IHttpResponse } from './http'

export interface Controller {
  handle: (request: IHttpRequest) => IHttpResponse
}
