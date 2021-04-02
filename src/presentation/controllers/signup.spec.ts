import { SignUpController } from './signup'
import { MissingParamError, InvalidParamError, ServerError } from '../errors'
import { IEmailValidator } from '../protocols/email-validator'

import faker from 'faker'

interface TypesSUT {
  sut: SignUpController
  emailValidatorStub: IEmailValidator
}

const makeSUT = (): TypesSUT => {
  class EmailValidatorStub implements IEmailValidator {
    isValid (email: string): boolean {
      return true
    }
  }
  const emailValidatorStub = new EmailValidatorStub()
  const sut = new SignUpController(emailValidatorStub)

  return {
    sut,
    emailValidatorStub
  }
}

describe('SignUp Controller', () => {
  it('should send 400 status if no name is provided', () => {
    const password = faker.internet.password()
    const { sut } = makeSUT()
    const httpRequest = {
      body: {
        email: faker.internet.email(),
        password,
        passwordConfirmation: password
      }
    }
    const httpResponse = sut.handle(httpRequest)

    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toEqual(new MissingParamError('name'))
  })

  it('should send 400 status if no email is provided', () => {
    const password = faker.internet.password()
    const { sut } = makeSUT()
    const httpRequest = {
      body: {
        name: faker.name.findName(),
        password,
        passwordConfirmation: password
      }
    }
    const httpResponse = sut.handle(httpRequest)

    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toEqual(new MissingParamError('email'))
  })

  it('should send 400 status if no password is provided', () => {
    const password = faker.internet.password()
    const { sut } = makeSUT()
    const httpRequest = {
      body: {
        name: faker.name.findName(),
        email: faker.internet.email(),
        passwordConfirmation: password
      }
    }
    const httpResponse = sut.handle(httpRequest)

    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toEqual(new MissingParamError('password'))
  })

  it('should send 400 status if no passwordConfirmation is provided', () => {
    const password = faker.internet.password()
    const { sut } = makeSUT()
    const httpRequest = {
      body: {
        name: faker.name.findName(),
        email: faker.internet.email(),
        password
      }
    }
    const httpResponse = sut.handle(httpRequest)

    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toEqual(new MissingParamError('passwordConfirmation'))
  })

  it('should send 400 status if an invalid email is provided', () => {
    const password = faker.internet.password()
    const { sut, emailValidatorStub } = makeSUT()
    jest.spyOn(emailValidatorStub, 'isValid').mockReturnValueOnce(false)

    const httpRequest = {
      body: {
        name: faker.name.findName(),
        email: faker.internet.email(),
        password,
        passwordConfirmation: password
      }
    }
    const httpResponse = sut.handle(httpRequest)

    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toEqual(new InvalidParamError('email'))
  })

  it('should call EmailValidator with the same email', () => {
    const password = faker.internet.password()
    const email = faker.internet.email()
    const { sut, emailValidatorStub } = makeSUT()
    const isValidEmail = jest.spyOn(emailValidatorStub, 'isValid')

    const httpRequest = {
      body: {
        name: faker.name.findName(),
        email,
        password,
        passwordConfirmation: password
      }
    }
    sut.handle(httpRequest)

    expect(isValidEmail).toHaveBeenCalledWith(email)
  })

  it('should send 500 status if EmailValidator throws an error', () => {
    class EmailValidatorStub implements IEmailValidator {
      isValid (email: string): boolean {
        throw new Error()
      }
    }

    const emailValidatorStub = new EmailValidatorStub()
    const sut = new SignUpController(emailValidatorStub)

    const password = faker.internet.password()
    const email = faker.internet.email()

    const httpRequest = {
      body: {
        name: faker.name.findName(),
        email,
        password,
        passwordConfirmation: password
      }
    }
    const httpResponse = sut.handle(httpRequest)
    expect(httpResponse.statusCode).toBe(500)
    expect(httpResponse.body).toEqual(new ServerError())
  })
})
