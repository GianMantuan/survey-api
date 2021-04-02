import { Controller, IEmailValidator, IHttpRequest, IHttpResponse } from '../protocols'
import { badRequest, serverError } from '../helpers/http-helper'
import { InvalidParamError, MissingParamError } from '../errors'
import { AddAccount } from '../../domain/usecases/add-account'

export class SignUpController implements Controller {
  private readonly emailValidator: IEmailValidator
  private readonly addAccount: AddAccount

  constructor (emailValidator: IEmailValidator, addAccount: AddAccount) {
    this.emailValidator = emailValidator
    this.addAccount = addAccount
  }

  handle (httpRequest: IHttpRequest): IHttpResponse {
    try {
      const requiredFileds = ['name', 'email', 'password', 'passwordConfirmation']
      for (const field of requiredFileds) {
        if (!httpRequest.body[field]) {
          return badRequest(new MissingParamError(field))
        }
      }

      const { name, email, password, passwordConfirmation } = httpRequest.body

      if (password !== passwordConfirmation) {
        return badRequest(new InvalidParamError('passwordConfirmation'))
      }

      if (!this.emailValidator.isValid(email)) {
        return badRequest(new InvalidParamError('email'))
      }

      this.addAccount.add({ name, email, password })

      return { statusCode: 200, body: {} }
    } catch (error) {
      return serverError()
    }
  }
}
