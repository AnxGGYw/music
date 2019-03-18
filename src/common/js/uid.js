let _uid = ''
const constant = 999999999

export const getUid = () => {
  if (_uid) {
    return _uid
  }
  if (!_uid) {
    const time = new Date().getMilliseconds()
    _uid = (Math.round(constant * Math.random()) * time % 1e10).toString()
  }
  return _uid
}
