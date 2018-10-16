import { CODE_SUCCESS } from 'api/config'

export const isEqualSuccessCode = (message) => {
  return Object.is(message, CODE_SUCCESS)
}
