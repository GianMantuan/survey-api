import { AccountModel } from '../model/account'

export interface IAddAccountDTO {
  name: string
  email: string
  password: string
}

export interface AddAccount {
  add: (account: IAddAccountDTO) => AccountModel
}
