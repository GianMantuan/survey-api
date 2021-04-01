import { SignUpController } from './signup'

import faker from 'faker'

describe('SignUp COntroller', () => {
  test('should return 400 if no name is provided', () => {
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
    expect(httpResponse.body).toEqual(new Error('Missing param: name'))
  })
})
