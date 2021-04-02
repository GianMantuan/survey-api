import { IEmailValidator, AccountModel, IAddAccountDTO, AddAccount } from './signup-protocols'
import { MissingParamError, InvalidParamError, ServerError } from '../../errors'
import { SignUpController } from './signup'

import faker from 'faker'

class EmailValidatorStub implements IEmailValidator {
  isValid (email: string): boolean {
    return true
  }
}

class AddAccountStub implements AddAccount {
  add (account: IAddAccountDTO): AccountModel {
    return {
      id: 'valid_id',
      name: 'valid_name',
      email: 'valid_email@email.com',
      password: 'valid_password'
    }
  }
}

interface TypesSUT {
  sut: SignUpController
  emailValidatorStub: IEmailValidator
  addAccountStub: AddAccount
}

const makeSUT = (): TypesSUT => {
  const emailValidatorStub = new EmailValidatorStub()
  const addAccountStub = new AddAccountStub()
  const sut = new SignUpController(emailValidatorStub, addAccountStub)

  return {
    sut,
    emailValidatorStub,
    addAccountStub
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

  it('should send 400 status if passwordConfirmation fails', () => {
    const { sut } = makeSUT()

    const httpRequest = {
      body: {
        name: faker.name.findName(),
        email: faker.internet.email(),
        password: faker.internet.password(),
        passwordConfirmation: 'invalid_password'
      }
    }

    const httpResponse = sut.handle(httpRequest)

    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toEqual(new InvalidParamError('passwordConfirmation'))
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

  it('should send 500 status if EmailValidator throws an error', () => {
    const password = faker.internet.password()

    const { sut, emailValidatorStub } = makeSUT()
    jest.spyOn(emailValidatorStub, 'isValid').mockImplementationOnce(() => { throw new Error() })

    const httpRequest = {
      body: {
        name: faker.name.findName(),
        email: faker.internet.email(),
        password,
        passwordConfirmation: password
      }
    }

    const httpResponse = sut.handle(httpRequest)

    expect(httpResponse.statusCode).toBe(500)
    expect(httpResponse.body).toEqual(new ServerError())
  })

  it('should send 500 status if AddAccount throws an error', () => {
    const password = faker.internet.password()

    const { sut, addAccountStub } = makeSUT()
    jest.spyOn(addAccountStub, 'add').mockImplementationOnce(() => { throw new Error() })

    const httpRequest = {
      body: {
        name: faker.name.findName(),
        email: faker.internet.email(),
        password,
        passwordConfirmation: password
      }
    }

    const httpResponse = sut.handle(httpRequest)

    expect(httpResponse.statusCode).toBe(500)
    expect(httpResponse.body).toEqual(new ServerError())
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

  it('should call AddAccount with correct values', () => {
    const name = faker.name.findName()
    const email = faker.internet.email()
    const password = faker.internet.password()

    const { sut, addAccountStub } = makeSUT()
    const addAccount = jest.spyOn(addAccountStub, 'add')

    const httpRequest = {
      body: {
        name,
        email,
        password,
        passwordConfirmation: password
      }
    }
    sut.handle(httpRequest)
    expect(addAccount).toHaveBeenCalledWith({ name, email, password })
  })

  it('should send 200 status if a valid account is provided', () => {
    const { sut } = makeSUT()

    const httpRequest = {
      body: {
        name: 'valid_name',
        email: 'valid_email@email.com',
        password: 'valid_password',
        passwordConfirmation: 'valid_password'
      }
    }
    const httpResponse = sut.handle(httpRequest)
    console.log(httpResponse)
    expect(httpResponse.statusCode).toBe(200)
    expect(httpResponse.body).toEqual({ id: 'valid_id', name: 'valid_name', email: 'valid_email@email.com', password: 'valid_password' })
  })
})
