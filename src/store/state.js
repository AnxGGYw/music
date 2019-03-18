import { playMode } from 'common/js/play.config.js'
import { loadSearch, loadPlay, loadFavorite } from 'common/js/cache'

const state = {
  singer: {},
  playing: false, // 播放状态(默认关闭)
  fullScreen: false, // 全屏(默认不全屏)
  playList: [], // 播放列表 (有顺序,单曲,随机播放)
  sequenceList: [], // 顺序列表
  mode: playMode.sequence, // 播放模式(默认顺序播放)
  currentIndex: -1, // 当前播放歌曲index
  disc: {},
  topList: {},
  searchHistory: loadSearch(), // localStorage缓存的搜索历史列表
  playHistory: loadPlay(), // localStorage缓存的播放历史列表
  favoriteList: loadFavorite() // localStorage缓存的收藏列表
}

export default state