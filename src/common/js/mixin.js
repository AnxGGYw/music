import { mapGetters, mapMutations, mapActions } from 'vuex'
import { playMode } from 'common/js/play.config'
import { shuffle } from 'common/js/util'

export const playListMixin = {
  computed: {
    ...mapGetters([
      'playList'
    ])
  },
  mounted() {
    this.handlePlayList(this.playList)
  },
  activated() {
    this.handlePlayList(this.playList)
  },
  methods: {
    handlePlayList() {
      throw new Error(`component must comprizal 'handlePlayList' method`)
    }
  },
  watch: {
    playList(newVal) {
      this.handlePlayList(newVal)
    }
  }
}

export const playerMixin = {
  computed: {
    iconMode() {
      return this.mode === playMode.sequence
        ? 'icon-sequence'
        : this.mode === playMode.loop
          ? 'icon-loop'
          : 'icon-random'
    },
    ...mapGetters([
      'sequenceList',
      'playList',
      'currentSong',
      'mode',
      'favoriteList'
    ])
  },
  methods: {
    changeMode() {
      const mode = (this.mode + 1) % 3
      this.setPlayMode(mode)
      let list = this.mode === playMode.random ? shuffle(this.sequenceList) : this.sequenceList
      this._resetCurrentIndex(list)
      this.setPlayList(list)
    },
    getFavoriteIcon(song) {
      return this.isFavorite(song) ? 'icon-favorite' : 'icon-not-favorite'
    },
    isFavorite(song) {
      const index = this.favoriteList.findIndex((item) => {
        return item.id === song.id
      })
      return ~index
    },
    toggleFavorite(song) {
      this.isFavorite(song) ? this.deleteFavoriteList(song) : this.saveFavoriteList(song)
    },
    ...mapMutations({
      'setPlayMode': 'SET_MODE',
      'setPlaying': 'SET_PLAYING',
      'setPlayList': 'SET_PLAY_LIST',
      'setCurrentIndex': 'SET_CURRENT_INDEX'
    }),
    _resetCurrentIndex(list) {
      let index = list.findIndex((item) => {
        return item.id === this.currentSong.id
      })
      this.setCurrentIndex(index)
    },
    ...mapActions([
      'saveFavoriteList',
      'deleteFavoriteList'
    ])
  }
}

export const searchMixin = {
  data() {
    return {
      query: '',
      refreshDelay: 120
    }
  },
  computed: {
    ...mapGetters([
      'searchHistory'
    ])
  },
  methods: {
    onQueryChange(query) {
      this.query = query
    },
    blur() {
      this.$refs['searchBox'].blur()
    },
    addQuery(query) {
      this.$refs['searchBox'].setQuery(query)
    },
    saveSearch() {
      this.saveSearchHistory(this.query)
    },
    ...mapActions([
      'saveSearchHistory',
      'deleteSearchHistory'
    ])
  }
}