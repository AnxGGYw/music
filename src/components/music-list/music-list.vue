<template>
  <div class="music-list">
    <div class="back" @click="back">
      <i class="icon-back"></i>
    </div>
    <h1 class="title" v-html="title" ref="title"></h1>
    <div class="bg-image" :style="backgroundStyle" ref="bgImage">
      <div class="play-wrapper" v-show="songs.length && isShowPlayBtn">
        <div class="fans-wrapper" ref="fansWrapper" v-show="songs.length">
          <h2 class="singer-name" v-html="title" :class="noFans"></h2>
          <div class="fans" v-if="fans">
            <span class="line"></span>
            <span class="text" >粉丝：{{fans}}万</span>
            <span class="line"></span>
          </div>
        </div>
        <div class="play" @click="random">
          <i class="icon-play"></i>
          <span class="text">{{btnText}}</span>
        </div>
      </div>
      <div class="filter" ref="filter"></div>
    </div>
    <div class="bg-layer" ref="layer"></div>
    <scroll
      :data="songs"
      :probeType="probeType"
      :listenScroll="listenScroll"
      @scroll="scroll"
      class="list"
      ref="list">
      <div class="song-list-wrapper">
        <song-list :songs="songs" @clickItem="clickSong" :rank="rank"></song-list>
      </div>
      <div class="loading-container" v-show="!songs.length">
        <loading></loading>
      </div>
    </scroll>
  </div>
</template>

<script type="text/ecmascript-6">
import Scroll from 'base/scroll/scroll'
import SongList from 'base/song-list/song-list'
import Loading from 'base/loading/loading'
import { prefixStyle } from 'common/js/dom'
import { mapActions } from 'vuex'
import { playListMixin } from 'common/js/mixin'

const RESERVED_HEIGHT = 40
const transform = prefixStyle('transform')
const backdropFilter = prefixStyle('backdrop-filter')
const RANDOM_ALL = '随机播放全部'

export default {
  mixins: [playListMixin],
  props: {
    bgImage: {
      type: String,
      default: ''
    },
    songs: {
      type: Array,
      default: () => []
    },
    title: {
      type: String,
      default: ''
    },
    fans: {
      type: Number,
      default: 0
    },
    rank: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      scrollY: -1,
      isShowPlayBtn: true
    }
  },
  created() {
    this.btnText = RANDOM_ALL
    this.probeType = 3
    this.listenScroll = true
  },
  computed: {
    backgroundStyle() {
      return `background-image: url(${this.bgImage})`
    },
    noFans() {
      return this.fans ? '' : 'singer-name-no-fans'
    }
  },
  mounted() {
    this.imageHeight = this.$refs['bgImage'].clientHeight
    this.minTranslateY = -this.imageHeight + RESERVED_HEIGHT
    this.$refs['list'].$el.style.top = `${this.imageHeight}px`
  },
  watch: {
    scrollY(newY) {
      let translateY = Math.max(this.minTranslateY, newY)
      this.$refs['layer'].style[transform] = `translate3d(0, ${translateY}px, 0)`
      let zIndex = 0
      let scale = 1
      let blur = 0
      const percent = Math.abs(Math.floor(newY) / this.imageHeight)
      if (newY > 0) {
        scale = 1 + percent
        zIndex = 10
      } else {
        blur = Math.min(30 * percent, 30)
      }
      this.$refs['filter'].style[backdropFilter] = `blur(${blur}px)`
      if (newY < this.minTranslateY / 2) {
        this.$refs['title'].style['line-height'] = '40px'
      } else {
        this.$refs['title'].style['line-height'] = 0
      }
      if (newY < this.minTranslateY) {
        zIndex = 10
        this.$refs['bgImage'].style.paddingTop = 0
        this.$refs['bgImage'].style.height = `${RESERVED_HEIGHT}px`
        this.isShowPlayBtn = false
      } else {
        this.$refs['bgImage'].style.paddingTop = '70%'
        this.$refs['bgImage'].style.height = 0
        this.isShowPlayBtn = true
      }
      this.$refs['bgImage'].style.zIndex = zIndex
      this.$refs['bgImage'].style[transform] = `scale(${scale})`
    }
  },
  methods: {
    scroll(pos) {
      this.scrollY = pos.y
    },
    back() {
      this.$router.back()
    },
    clickSong(item, index) {
      this.selectPlay({
        list: this.songs,
        index
      })
    },
    random() {
      this.randomPlay({
        list: this.songs
      })
    },
    handlePlayList(playList) {
      const bottom = playList.length ? '60px' : ''
      this.$refs['list'].$el.style.bottom = bottom
      this.$refs['list'].refresh()
    },
    ...mapActions([
      'selectPlay',
      'randomPlay'
    ])
  },
  components: {
    Scroll,
    SongList,
    Loading
  }
}
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"
  @import "~common/stylus/mixin"
  .music-list
    position: fixed
    z-index: 100
    top: 0
    left: 0
    bottom: 0
    right: 0
    background: $color-background
    .back
      position absolute
      top: 0
      left: 6px
      z-index: 50
      .icon-back
        display: block
        padding: 10px
        font-size: $font-size-large-x
        color: $color-theme
    .title
      position: absolute
      top: 0
      left: 10%
      z-index: 40
      width: 80%
      no-wrap()
      text-align: center
      line-height: 0
      font-size: $font-size-large
      color: $color-text
      transition: .3s
    .bg-image
      position: relative
      width: 100%
      height: 0
      padding-top: 70%
      transform-origin: top
      background-size: cover
      background-position: 0px -45px
      .play-wrapper
        position: absolute
        bottom: 20px
        z-index: 50
        width: 100%
        .singer-name
          width: 100%
          height: 20px
          text-align: center
          font-size: 16px
          margin-bottom: 10px
          transition: .3s
        .singer-name-no-fans
          margin-bottom 40px
        .fans
          width: 100%
          height: 20px
          margin-bottom: 10px
          text-align: center
          font-size: 14px
          .line
            display: inline-block
            width: 60px
            border-bottom: 1px solid #fff
            vertical-align: middle
            opacity: .3
            border-radius: 50%
          .text
            padding: 0 5px
            opacity: 0.8
        .play
          box-sizing: border-box
          width: 135px
          padding: 7px 0
          margin: 0 auto
          text-align: center
          border: 1px solid $color-theme
          color: $color-theme
          border-radius: 100px
          font-size: 0
          .icon-play
            display: inline-block
            vertical-align: middle
            margin-right: 6px
            font-size: $font-size-medium-x
          .text
            display: inline-block
            vertical-align: middle
            font-size: $font-size-small
      .filter
        position: absolute
        top: 0
        left: 0
        width: 100%
        height: 100%
        background: rgba(7, 17, 27, 0.4)
    .bg-layer
      position: relative
      height: 100%
      background: $color-background
    .list
      position: fixed
      top: 0
      bottom: 0
      width: 100%
      background: $color-background
      .song-list-wrapper
        padding: 20px 0 20px 30px
      .loading-container
        position: absolute
        width: 100%
        top: 50%
        transform: translateY(-50%)
</style>
