import { SignUpController } from './signup'
import { MissingParamError } from '../errors/missing-param'

import faker from 'faker'

describe('SignUp COntroller', () => {
  it('should return 400 if no name is provided', () => {
    const password = faker.internet.password()
    const sut = new SignUpController()
    const httpRequest = {
      body: {
        email: faker.internet.email(),
        password,
        passworfConfirmation: password
      }
    }
    const httpResponse = sut.handle(httpRequest)

    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toEqual(new MissingParamError('name'))
  })

  it('should return 400 if no email is provided', () => {
    const password = faker.internet.password()
    const sut = new SignUpController()
    const httpRequest = {
      body: {
        name: faker.name.findName(),
        password,
        passworfConfirmation: password
      }
    }
    const httpResponse = sut.handle(httpRequest)

    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toEqual(new MissingParamError('email'))
  })
  it('should return 400 if no password is provided', () => {
    const password = faker.internet.password()
    const sut = new SignUpController()
    const httpRequest = {
      body: {
        name: faker.name.findName(),
        email: faker.internet.email(),
        passworfConfirmation: password
      }
    }
    const httpResponse = sut.handle(httpRequest)

    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toEqual(new MissingParamError('password'))
  })
  it('should return 400 if no passwordConfirmation is provided', () => {
    const password = faker.internet.password()
    const sut = new SignUpController()
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
})
