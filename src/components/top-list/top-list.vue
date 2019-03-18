<template>
  <transition name="slide">
    <music-list :rank="rank" :title="title" :bg-image="bgImage" :songs="songs" :updateTime="updateTime"></music-list>
  </transition>
</template>

<script type="text/ecmascript-6">
import MusicList from 'components/music-list/music-list'
import { mapGetters } from 'vuex'
import { getMusicList } from 'api/rank'
import { isEqualSuccessCode } from 'common/js/util'
import { createSong, isPassValid, supplementSongsPurl } from 'common/entity/song'

export default {
  computed: {
    title() {
      return this.topList.topTitle
    },
    bgImage() {
      if (this.songs.length) {
        return this.songs[0].image
      }
      return ''
    },
    ...mapGetters([
      'topList'
    ])
  },
  created() {
    this._getMusicList()
  },
  data() {
    return {
      songs: [],
      updateTime: '',
      rank: true
    }
  },
  methods: {
    async _getMusicList() {
      if (!this.topList.id) {
        this.$router.push('/rank')
        return
      }
      const res = await getMusicList(this.topList.id)
      if (isEqualSuccessCode(res.code)) {
        this.updateTime = res.update_time
        this.songs = await supplementSongsPurl(this._normalizeSongs(res.songlist))
      }
    },
    _normalizeSongs(list) {
      let result = []
      list.forEach((item) => {
        const musicData = item.data
        if (isPassValid(musicData)) {
          result.push(createSong(musicData))
        }
      })
      return result
    }
  },
  components: {
    MusicList
  }
}
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  .slide-enter-active, .slide-leave-active
    transition: all 0.3s ease

  .slide-enter, .slide-leave-to
    transform: translate3d(100%, 0, 0)
</style>
