import * as types from './mutation-types'
import { playMode } from 'common/js/play.config.js'
import { shuffle } from 'common/js/util'
import { saveSearch, deleteSearch, clearSearch, savePlay, saveFavorite, deleteFavorite } from 'common/js/cache'

export const selectPlay = ({commit, state}, {list, index}) => {
  commit(types.SET_SEQUENCE_LIST, list)
  if (state.mode === playMode.random) {
    let randomList = shuffle(list)
    commit(types.SET_PLAY_LIST, randomList)
    index = findIndex(randomList, list[index])
  } else {
    commit(types.SET_PLAY_LIST, list)
  }
  commit(types.SET_FULL_SCREEN, true)
  commit(types.SET_PLAYING, true)
  commit(types.SET_CURRENT_INDEX, index)
}

export const randomPlay = ({commit}, {list}) => {
  commit(types.SET_MODE, playMode.random)
  commit(types.SET_SEQUENCE_LIST, list)
  let randomList = shuffle(list)
  commit(types.SET_PLAY_LIST, randomList)
  commit(types.SET_CURRENT_INDEX, 0)
  commit(types.SET_FULL_SCREEN, true)
  commit(types.SET_PLAYING, true)
}

export const insertSong = ({commit, state}, song) => {
  let playList = state.playList.slice()
  let sequenceList = state.sequenceList.slice()
  let currentIndex = state.currentIndex
  // 记录当前歌曲
  let currentSong = playList[currentIndex]
  // 插入歌曲，索引加1
  currentIndex++
  // 查找当前列表中是否有待插入的歌曲并返回索引
  let pIndex = findIndex(playList, song)
  playList.splice(currentIndex, 0, song)
  // 如果包含了这首歌
  if (~pIndex) {
    // 如果当前我们插入的序号大于列表中的序号
    if (currentIndex > pIndex) {
      playList.splice(pIndex, 1)
      currentIndex--
    } else {
      playList.splice(pIndex + 1, 1)
    }
  }
  let currentSequenceIndex = findIndex(sequenceList, currentSong) + 1
  let sIndex = findIndex(sequenceList, song)
  sequenceList.splice(currentSequenceIndex, 0, song)
  if (~sIndex) {
    if (currentSequenceIndex > sIndex) {
      sequenceList.splice(sIndex, 1)
    } else {
      sequenceList.splice(sIndex + 1, 1)
    }
  }
  commit(types.SET_PLAY_LIST, playList)
  commit(types.SET_SEQUENCE_LIST, sequenceList)
  commit(types.SET_CURRENT_INDEX, currentIndex)
  commit(types.SET_FULL_SCREEN, true)
  commit(types.SET_PLAYING, true)
}

export const saveSearchHistory = ({commit}, query) => {
  commit(types.SET_SEARCH_HISTORY, saveSearch(query))
}

export const deleteSearchHistory = ({commit}, query) => {
  commit(types.SET_SEARCH_HISTORY, deleteSearch(query))
}

export const clearSearchHistory = ({commit}) => {
  commit(types.SET_SEARCH_HISTORY, clearSearch())
}

export const deleteSong = ({commit, state}, song) => {
  let playList = state.playList.slice()
  let sequenceList = state.sequenceList.slice()
  let currentIndex = state.currentIndex
  let pIndex = findIndex(playList, song)
  playList.splice(pIndex, 1)
  let sIndex = findIndex(sequenceList, song)
  sequenceList.splice(sIndex, 1)
  if (currentIndex > pIndex || currentIndex === playList.length) {
    currentIndex--
  }
  commit(types.SET_PLAY_LIST, playList)
  commit(types.SET_SEQUENCE_LIST, sequenceList)
  commit(types.SET_CURRENT_INDEX, currentIndex)

  const playingState = playList.length > 0
  commit(types.SET_PLAYING, playingState)
}

export const deleteSongList = ({commit}) => {
  commit(types.SET_PLAY_LIST, [])
  commit(types.SET_SEQUENCE_LIST, [])
  commit(types.SET_CURRENT_INDEX, -1)
  commit(types.SET_PLAYING, false)
}

export const savePlayHistory = ({commit}, song) => {
  commit(types.SET_PLAY_HISTORY, savePlay(song))
}

export const saveFavoriteList = ({commit}, song) => {
  commit(types.SET_FAVORITE_LIST, saveFavorite(song))
}

export const deleteFavoriteList = ({commit}, song) => {
  commit(types.SET_FAVORITE_LIST, deleteFavorite(song))
}

const findIndex = (list, song) => {
  return list.findIndex((item) => {
    return item.id === song.id
  })
}