import { CODE_SUCCESS } from 'api/config'
import _shuffle from 'lodash/shuffle'

export const isEqualSuccessCode = (message) => {
  return Object.is(message, CODE_SUCCESS)
}

export const shuffle = (arr) => {
  return _shuffle(arr)
}

// picUrl格式化成https, 以免警告
export const normalizeHttpsUrl = (data, prop) => {
  for (let item of data) {
    item[prop] = item[prop].replace('http', 'https')
  }
  return data
}

export const debounce = (func, delay) => {
  let timer
  return function (...args) {
    if (timer) {
      clearTimeout(timer)
    }
    timer = setTimeout(() => {
      func.apply(this, args)
    }, delay)
  }
}
