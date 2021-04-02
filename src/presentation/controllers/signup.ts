import { MissingParamError } from '../errors/missing-param'
import { IHttpRequest, IHttpResponse } from '../protocols/http'
import { badRequest } from '../helpers/http-helper'

export class SignUpController {
  handle (httpRequest: IHttpRequest): IHttpResponse {
    const requiredFileds = ['name', 'email', 'password']
    for (const field of requiredFileds) {
      if (!httpRequest.body[field]) {
        return badRequest(new MissingParamError(field))
      }
    }
    return { statusCode: 200, body: {} }
  }
}
