import storage from 'good-storage'

const SEARCH_KEY = '__search__'
const SEARCH_MAX_LENGTH = 50

const PLAY_KEY = '__play__'
const PLAY_MAX_LENGTH = 200

const FAVORITE_KEY = '__favorite__'
const FAVORITE_MAX_LENGTH = 200

// 缓存搜索列表
export const saveSearch = (query) => {
  let currSearches = storage.get(SEARCH_KEY, [])
  insertArray(currSearches, query, (item) => {
    return item === query
  }, SEARCH_MAX_LENGTH)
  storage.set(SEARCH_KEY, currSearches)
  return currSearches
}

// 读取搜索列表
export const loadSearch = () => {
  return storage.get(SEARCH_KEY, [])
}

// 删除搜索列表
export const deleteSearch = (query) => {
  let currSearches = storage.get(SEARCH_KEY, [])
  deleteFromArray(currSearches, (item) => {
    return item === query
  })
  storage.set(SEARCH_KEY, currSearches)
  return currSearches
}

// 清空搜索列表
export const clearSearch = () => {
  storage.remove(SEARCH_KEY)
  return []
}

// 缓存播放列表
export const savePlay = (song) => {
  let songs = storage.get(PLAY_KEY, [])
  insertArray(songs, song, (item) => {
    return song.id === item.id
  }, PLAY_MAX_LENGTH)
  storage.set(PLAY_KEY, songs)
  return songs
}
// 读取播放列表
export const loadPlay = () => {
  return storage.get(PLAY_KEY, [])
}

// 缓存收藏列表
export const saveFavorite = (song) => {
  let songs = storage.get(FAVORITE_KEY, [])
  insertArray(songs, song, (item) => {
    return song.id === item.id
  }, FAVORITE_MAX_LENGTH)
  storage.set(FAVORITE_KEY, songs)
  return songs
}

// 读取收藏列表
export const loadFavorite = () => {
  return storage.get(FAVORITE_KEY, [])
}

// 删除收藏列表
export const deleteFavorite = (song) => {
  let songs = storage.get(FAVORITE_KEY, [])
  deleteFromArray(songs, (item) => {
    return item.id === song.id
  })
  storage.set(FAVORITE_KEY, songs)
  return songs
}

/**
 * insertArray 逻辑
 * 1: 判断当前localStorage缓存是否已经存在需要插入的数据
 * 2: 如果存在, 并且在第一位(当前缓存只有一个数据) 直接return
 * 3: 将数据插入到第一位
 * 4: 判断是否有缓存长度限制, 如果有, 就把最后一位删除(保证需要维护数据的最大长度)
 * @param {*} arr 当前localStorage缓存的数据
 * @param {*} value 需要插入的数据
 * @param {*} compare 比较函数
 * @param {*} maxlength 最多缓存长度
 */
const insertArray = (arr, value, compare, maxlength) => {
  const index = arr.findIndex(compare)
  if (index === 0) {
    return
  }
  if (index > 0) {
    arr.splice(index, 1)
  }
  arr.unshift(value)
  if (maxlength && arr.length > maxlength) {
    arr.pop()
  }
}

// 从数组中删除
const deleteFromArray = (arr, compare) => {
  const index = arr.findIndex(compare)
  if (~index) {
    arr.splice(index, 1)
  }
}
