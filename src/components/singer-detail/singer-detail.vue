<template>
  <transition name="slide">
    <music-list
      :songs="songs"
      :title="title"
      :fans="fans"
      :bg-image="backgroundImage"
      ></music-list>
  </transition>
</template>

<script type="text/ecmascript-6">
import MusicList from 'components/music-list/music-list'
import { mapGetters } from 'vuex'
import { getSingerDetail } from 'api/singer'
import { isEqualSuccessCode } from 'common/js/util'
import { createSong, isPassValid, supplementSongsPurl } from 'common/entity/song'

export default {
  computed: {
    title() {
      return this.singer.name
    },
    backgroundImage() {
      return this.singer.avatar
    },
    ...mapGetters([
      'singer'
    ])
  },
  data() {
    return {
      songs: [],
      fans: 0
    }
  },
  created() {
    this._getSingerDetail()
  },
  methods: {
    async _getSingerDetail() {
      if (!this.singer.mid) {
        this.$router.push({
          path: '/singer'
        })
        return
      }
      let res = await getSingerDetail(this.singer.mid)
      if (isEqualSuccessCode(res.code)) {
        this.fans = this._formatFans(res.data.fans)
        this.songs = await supplementSongsPurl(this._normalizeSongs(res.data.list))
      }
    },
    _normalizeSongs(list) {
      let ret = []
      list.forEach((item) => {
        let { musicData } = item
        if (isPassValid(musicData)) {
          ret.push(createSong(musicData))
        }
      })
      return ret
    },
    _formatFans(num) {
      return parseFloat((num / 10000).toFixed(1))
    }
  },
  components: {
    MusicList
  }
}
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"

  .slide-enter-active, .slide-leave-active
    transition: all .3s

  .slide-enter, .slide-leave-to
    transform: translate3d(100%, 0, 0)
</style>
