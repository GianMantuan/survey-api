import { MissingParamError } from '../errors/missing-param'
import { IHttpRequest, IHttpResponse } from '../protocols/http'
import { badRequest } from '../helpers/http-helper'
import { Controller } from '../protocols/Controller'

export class SignUpController implements Controller {
  handle (httpRequest: IHttpRequest): IHttpResponse {
    const requiredFileds = ['name', 'email', 'password', 'passwordConfirmation']
    for (const field of requiredFileds) {
      if (!httpRequest.body[field]) {
        return badRequest(new MissingParamError(field))
      }
    }
    return { statusCode: 200, body: {} }
  }
}
