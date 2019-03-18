<template>
  <transition name="slide">
    <music-list
      :songs="songs"
      :fans="fans"
      :title="title"
      :bg-image="bgImage"
      :nickName="nickName"
    ></music-list>
  </transition>
</template>

<script type="text/ecmascript-6">
import MusicList from 'components/music-list/music-list'
import { mapGetters } from 'vuex'
import { getCdInfoList } from 'api/recommend'
import { isEqualSuccessCode } from 'common/js/util'
import { createSong, isPassValid, supplementSongsPurl } from 'common/entity/song'

export default {
  computed: {
    title() {
      return this.disc.dissname
    },
    bgImage() {
      return this.disc.imgurl
    },
    ...mapGetters([
      'disc'
    ])
  },
  data() {
    return {
      songs: [],
      nickName: ''
    }
  },
  created() {
    this.fans = 0
    this._getCdInfoList()
  },
  methods: {
    async _getCdInfoList() {
      if (!this.disc.dissid) {
        this.$router.push('/recommend')
        return
      }
      const res = await getCdInfoList(this.disc.dissid)
      if (isEqualSuccessCode(res.code)) {
        this.nickName = res.cdlist[0].nickname // 仅为了替换粉丝dom
        this.songs = await supplementSongsPurl(this._normalizeCdInfoList(res.cdlist[0].songlist))
      }
    },
    _normalizeCdInfoList(list) {
      let result = []
      list.forEach(musicData => {
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
    transition: all 0.3s

  .slide-enter, .slide-leave-to
    transform: translate3d(100%, 0, 0)
</style>
