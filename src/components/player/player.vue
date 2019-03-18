<template>
  <div class="player" v-show="playList.length">
    <transition
      name="normal"
      @enter="enter"
      @after-enter="afterEnter"
      @leave="leave"
      @after-leave="afterLeave"
    >
      <div class="normal-player" v-show="fullScreen">
        <div class="background">
          <img :src="currentSong.image" alt="" width="100%" height="100%">
        </div>
        <div class="top">
          <div class="back" @click="narrow">
            <i class="icon-back"></i>
          </div>
          <h1 class="title" v-html="currentSong.name"></h1>
          <h2 class="subtitle" v-html="currentSong.singer"></h2>
        </div>
        <div class="middle"
             @touchstart.prevent="middleTouchStart"
             @touchmove.prevent="middleTouchMove"
             @touchend="middleTouchEnd"
        >
          <div class="middle-l" ref="middleL">
            <div class="cd-wrapper" ref="cdWrapper">
              <div class="cd"  ref="imageWrapper">
                <img ref="image" :class="cdRotate" :src="currentSong.image" alt="" class="image">
              </div>
            </div>
            <div class="playing-lyric-wrapper">
              <div class="playing-lyric" :class="lyricClass">{{playingLyric}}</div>
            </div>
          </div>
          <scroll ref="lyricList" class="middle-r" :data="currentLyric && currentLyric.lines" v-show="currentLyric">
            <div class="lyric-wrapper" ref="lyricWrapper">
              <div v-if="currentLyric">
                <p ref="lyricLine"
                  class="text"
                  :class="{current: currentLyricLineNum === index}"
                  v-for="(line, index) in currentLyric.lines"
                  :key="index"
                >{{line.txt}}</p>
              </div>
            </div>
          </scroll>
        </div>
        <div class="bottom">
          <div class="dot-wrapper">
            <span class="dot" :class="{'active': currentShow === 'cd'}"></span>
            <span class="dot" :class="{'active': currentShow === 'lyric'}"></span>
          </div>
          <div class="progress-wrapper">
            <span class="time time-l">{{formatTime(currentTime)}}</span>
            <div class="progress-bar-wrapper">
              <progress-bar :percent="percent" @percentChange="onProgressBarChange" ref="progressBar"></progress-bar>
            </div>
            <span class="time time-r">{{formatTime(currentSong.duration)}}</span>
          </div>
          <div class="operators">
            <div class="icon i-left" @click="changeMode">
              <i :class="iconMode"></i>
            </div>
            <div class="icon i-left" :class="disableClass">
              <i class="icon-prev" @click="prev"></i>
            </div>
            <div class="icon i-center" :class="disableClass">
              <i :class="playIcon" @click="togglePlaying"></i>
            </div>
            <div class="icon i-right" :class="disableClass">
              <i class="icon-next" @click="next"></i>
            </div>
            <div class="icon i-right">
              <i class="icon" :class="getFavoriteIcon(currentSong)" @click="toggleFavorite(currentSong)"></i>
            </div>
          </div>
        </div>
      </div>
    </transition>
    <transition name="mini">
      <div class="mini-player" v-show="!fullScreen" @click="open">
        <div class="icon" ref="miniPlayImage">
          <div class="imgWrapper" ref="miniWrapper">
            <img ref="miniImage" :src="currentSong.image" alt="" width="40" height="40" :class="cdRotate">
          </div>
        </div>
        <div class="text">
          <h2 class="name" v-html="currentSong.name"></h2>
          <p class="desc" v-html="currentSong.singer"></p>
        </div>
        <div class="control" >
          <progress-circle :radius="radius" :percent="percent">
            <i :class="miniPlayIcon" class="icon-mini" @click.stop="togglePlaying"></i>
          </progress-circle>
        </div>
        <div class="control" @click.stop="showPlayList">
          <i class="icon-playlist"></i>
        </div>
      </div>
    </transition>
    <playlist ref="playList"></playlist>
    <audio
      :src="currentSong.url"
      ref="audio"
      @playing="ready"
      @error="error"
      @timeupdate="timeUpdate"
      @ended="end"
    ></audio>
  </div>
</template>

<script type="text/ecmascript-6">
import createKeyframeAnimation from 'create-keyframe-animation'
import ProgressBar from 'base/progress-bar/progress-bar'
import ProgressCircle from 'base/progress-circle/progress-circle'
import LyricParser from 'lyric-parser'
import Scroll from 'base/scroll/scroll'
import Playlist from 'components/play-list/play-list'
import { mapGetters, mapMutations, mapActions } from 'vuex'
import { prefixStyle, addClass, removeClass, hasClass } from 'common/js/dom'
import { playMode } from 'common/js/play.config'
import { playerMixin } from 'common/js/mixin'

const transform = prefixStyle('transform')
const transitionDuration = prefixStyle('transitionDuration')
const PADD_LENGTH = 2
const AUDIO_VOLUME = 0.3
const LYRIC_OFFSET = 5
const CURRENT_SHOW_CD = 'cd'
const CURRENT_SHOW_LYRIC = 'lyric'
const CURRENT_SHOW_LIMIT_PERCENT = 0.1

export default {
  mixins: [playerMixin],
  created() {
    this.radius = 32
    this.touch = {}
  },
  data() {
    return {
      songReady: false,
      currentTime: 0,
      currentLyric: null,
      currentLyricLineNum: 0,
      currentShow: CURRENT_SHOW_CD,
      playingLyric: ''
    }
  },
  computed: {
    playIcon() {
      return this.playing ? 'icon-pause' : 'icon-play'
    },
    miniPlayIcon() {
      return this.playing ? 'icon-pause-mini' : 'icon-play-mini'
    },
    cdRotate() {
      return this.playing ? 'play' : ''
    },
    disableClass() {
      return this.songReady ? '' : 'disable'
    },
    percent() {
      return this.currentTime / this.currentSong.duration
    },
    lyricClass() {
      return this.playing ? '' : 'paused'
    },
    ...mapGetters([
      'fullScreen',
      'playing',
      'currentIndex'
    ])
  },
  methods: {
    // close full player, open mini player
    narrow() {
      let _transform = this.playing ? this._calculateWrapperTransform('imageWrapper', 'image') : this.transform
      this.$refs['miniWrapper'].style[transform] = _transform
      this.setFullScreen(false)
    },
    // open full player, close mini player
    open() {
      let _transform = this.playing ? this._calculateWrapperTransform('miniWrapper', 'miniImage') : this.transform
      this.$refs['imageWrapper'].style[transform] = _transform
      this.setFullScreen(true)
    },
    enter(el, done) {
      const {x, y, scale} = this._getPosAndScale()
      let animation = {
        0: {
          transform: `translate3d(${x}px, ${y}px, 0) scale(${scale})`
        },
        60: {
          transform: 'translate3d(0, 0, 0) scale(1.2)'
        },
        100: {
          transform: 'translate3d(0, 0, 0) scale(1)'
        }
      }
      createKeyframeAnimation.registerAnimation({
        name: 'move',
        animation,
        presets: {
          duration: 400,
          easing: 'ease-in'
        }
      })
      createKeyframeAnimation.runAnimation(this.$refs['cdWrapper'], 'move', done)
    },
    afterEnter() {
      createKeyframeAnimation.unregisterAnimation('move')
      this.$refs['cdWrapper'].style.animation = ''
    },
    leave(el, done) {
      addClass(this.$refs['miniPlayImage'], 'scale')
      this.$refs['cdWrapper'].style.transition = '.4s'
      const {x, y, scale} = this._getPosAndScale()
      this.$refs['cdWrapper'].style[transform] = `translate3d(${x}px, ${y}px, 0) scale(${scale})`
      this.$refs['cdWrapper'].addEventListener('transitionend', done)
    },
    afterLeave() {
      removeClass(this.$refs['miniPlayImage'], 'scale')
      this.$refs['cdWrapper'].style.transition = ''
      this.$refs['cdWrapper'].style[transform] = ''
    },
    // switch playMode status
    togglePlaying() {
      if (!this.songReady) {
        return
      }
      this.setPlaying(!this.playing)
      let children = this.$refs['lyricWrapper'].firstChild.children
      let currentLyric = Array.from(children).filter((item) => {
        return hasClass(item, 'current')
      })
      !this.playing ? addClass(currentLyric[0], 'paused') : removeClass(currentLyric[0], 'paused')
      if (this.currentLyric) {
        this.currentLyric.togglePlay()
      }
    },
    // prev song
    prev() {
      if (this.songReady) {
        if (this.playList.length === 1) {
          this.loop()
        } else {
          this._changeCurrentSong(false)
        }
      }
    },
    // next song
    next() {
      if (this.songReady) {
        if (this.playList.length === 1) {
          this.loop()
        } else {
          this._changeCurrentSong(true)
        }
      }
    },
    // song load success
    ready() {
      this.songReady = true
      this.savePlayHistory(this.currentSong)
    },
    // song load error
    error() {
      this.songReady = true
    },
    timeUpdate(e) {
      this.currentTime = e.target.currentTime
    },
    end() {
      this.currentTime = 0
      this.mode === playMode.loop ? this.loop() : this.next()
    },
    loop() {
      this.$refs['audio'].currentTime = 0
      this.$refs['audio'].play()
      if (this.currentLyric) {
        this.currentLyric.seek(0)
      }
      this.setPlaying(true)
    },
    formatTime(interval) {
      interval = interval | 0
      const minute = (interval / 60 | 0).toString().padStart(PADD_LENGTH, '0')
      const second = (interval % 60).toString().padStart(PADD_LENGTH, '0')
      return `${minute}:${second}`
    },
    // progress bar percent change
    onProgressBarChange(percent) {
      const currentTime = percent * this.currentSong.duration
      this.$refs['audio'].currentTime = currentTime
      if (this.currentLyric) {
        this.currentLyric.seek(currentTime * 1000)
      }
      if (!this.playing) {
        this.togglePlaying()
      }
    },
    middleTouchStart(e) {
      this.touch.inited = true
      this.touch.startX = e.touches[0].pageX
      this.touch.startY = e.touches[0].pageY
    },
    middleTouchMove(e) {
      if (!this.touch.inited) {
        return
      }
      const touch = e.touches[0]
      const deltaX = touch.pageX - this.touch.startX
      const deltaY = touch.pageY - this.touch.startY
      // 当纵轴方向的移动偏差大于横轴方向的移动偏差的时候 (只左右, 不上下)
      if (Math.abs(deltaY) > Math.abs(deltaX)) {
        return
      }
      const left = this.currentShow === CURRENT_SHOW_CD ? 0 : -window.innerWidth
      const offsetWidth = Math.min(0, Math.max(-window.innerWidth, left + deltaX))
      this.touch.percent = Math.abs(offsetWidth / window.innerWidth)
      this.$refs['lyricList'].$el.style[transform] = `translate3d(${offsetWidth}px, 0, 0)`
      this.$refs['lyricList'].$el.style[transitionDuration] = 0
      this.$refs['middleL'].style.opacity = 1 - this.touch.percent
      this.$refs['middleL'].style[transitionDuration] = 0
    },
    middleTouchEnd() {
      let offsetWidth
      let opacity
      // 从右往左划
      if (this.currentShow === CURRENT_SHOW_CD) {
        if (this.touch.percent > CURRENT_SHOW_LIMIT_PERCENT) {
          offsetWidth = -window.innerWidth
          this.currentShow = CURRENT_SHOW_LYRIC
          opacity = 0
        } else {
          offsetWidth = 0
          opacity = 1
        }
      } else { // 从左往右划
        if (this.touch.percent < (1 - CURRENT_SHOW_LIMIT_PERCENT)) {
          offsetWidth = 0
          opacity = 1
          this.currentShow = CURRENT_SHOW_CD
        } else {
          opacity = 0
          offsetWidth = -window.innerWidth
        }
      }
      this.touch.percent = Math.abs(offsetWidth / window.innerWidth)

      const durationTime = 300
      this.$refs['lyricList'].$el.style[transform] = `translate3d(${offsetWidth}px, 0, 0)`
      this.$refs['lyricList'].$el.style[transitionDuration] = `${durationTime}ms`
      this.$refs['middleL'].style.opacity = opacity
      this.$refs['middleL'].style[transitionDuration] = `${durationTime}ms`
    },
    async getLyric() {
      try {
        let lyric = await this.currentSong.getSongLyric()
        if (this.currentSong.lyric !== lyric) {
          return
        }
        this.currentLyric = new LyricParser(lyric, this._handleLyric)
        if (this.playing) {
          this.currentLyric.play()
        }
      } catch (e) {
        this.currentLyric = null
        this.playingLyric = ''
        this.currentLineNum = 0
      }
    },
    showPlayList() {
      this.$refs['playList'].show()
    },
    _handleLyric({lineNum, txt}) {
      this.currentLyricLineNum = lineNum
      if (lineNum > LYRIC_OFFSET) {
        let line = this.$refs['lyricLine'][lineNum - LYRIC_OFFSET]
        this.$refs['lyricList'].scrollToElement(line, 1000)
      } else {
        this.$refs['lyricList'].scrollTo(0, 0, 1000)
      }
      this.playingLyric = txt
    },
    _getPosAndScale() {
      const targetWidth = 40 // target width
      const paddingLeft = 40 // The distance from the small picture center to the left
      const paddingBottom = 30 // The distance from the big picture center to the bottom
      const paddingTop = 80 // The distance from the big picture to the top
      const width = window.innerWidth * 0.8 // big picture width
      const scale = targetWidth / width // initial scale
      const x = -(window.innerWidth / 2 - paddingLeft) // x-axis relative distance
      const y = window.innerHeight - paddingBottom - (width / 2) - paddingTop // y-axis relative distance
      return {
        x,
        y,
        scale
      }
    },
    _changeCurrentSong(isNext) {
      let index = null
      if (isNext) {
        index = (this.currentIndex + 1) % this.playList.length
      } else {
        index = this.currentIndex - 1
        index = index < 0 ? this.playList.length : index
      }
      this.setCurrentIndex(index)
      if (!this.playing) {
        this.togglePlaying()
      }
      this.songReady = false
    },
    _syncWrapperTransform(wrapper, inner) {
      let _transfrom = this._calculateWrapperTransform(wrapper, inner)
      this.$refs[wrapper].style[transform] = _transfrom
      this.transform = _transfrom
    },
    _calculateWrapperTransform(wrapper, inner) {
      if (!this.$refs[wrapper]) {
        return
      }
      let imageWrapper = this.$refs[wrapper]
      let image = this.$refs[inner]
      let wTransform = getComputedStyle(imageWrapper)[transform]
      let iTransform = getComputedStyle(image)[transform]
      return wTransform === 'none' ? iTransform : iTransform.concat(' ', wTransform)
    },
    ...mapMutations({
      'setFullScreen': 'SET_FULL_SCREEN'
    }),
    ...mapActions([
      'savePlayHistory'
    ])
  },
  watch: {
    currentSong(newSong, oldSong) {
      if (!newSong.id || !newSong.url || newSong.id === oldSong.id) {
        return
      }
      if (this.currentLyric) {
        this.currentLyric.stop()
      }
      clearInterval(this.timer)
      this.timer = setTimeout(() => {
        this.$refs['audio'].volume = AUDIO_VOLUME
        this.$refs['audio'].play()
        this.getLyric()
      }, 1000)
    },
    playing(newPlayingState) {
      const audio = this.$refs['audio']
      this.$nextTick(() => {
        newPlayingState ? audio.play() : audio.pause()
      })
      if (!newPlayingState) {
        if (this.fullScreen) {
          this._syncWrapperTransform('imageWrapper', 'image')
        } else {
          this._syncWrapperTransform('miniWrapper', 'miniImage')
        }
      }
    },
    // when the screen is full, set the position of the progress bar
    fullScreen(isFull) {
      if (isFull) {
        setTimeout(() => {
          this.$refs['progressBar'].setProgressOffset(this.percent)
        }, 20)
      }
    }
  },
  components: {
    ProgressBar,
    ProgressCircle,
    Scroll,
    Playlist
  }
}
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"
  @import "~common/stylus/mixin"
  .player
    .normal-player
      position: fixed
      left: 0
      right: 0
      top: 0
      bottom: 0
      z-index: 150
      background: $color-background
      .background
        position: absolute
        left: 0
        top: 0
        width: 100%
        height: 100%
        z-index: -1
        opacity: 0.6
        filter: blur(20px)
      .top
        position: relative
        margin-bottom: 25px
        .back
          position absolute
          top: 0
          left: 6px
          z-index: 50
          .icon-back
            display: block
            padding: 9px
            font-size: $font-size-large-x
            color: $color-theme
            transform: rotate(-90deg)
        .title
          width: 70%
          margin: 0 auto
          line-height: 40px
          text-align: center
          no-wrap()
          font-size: $font-size-large
          color: $color-text
        .subtitle
          line-height: 20px
          text-align: center
          font-size: $font-size-medium
          color: $color-text
      .middle
        position: fixed
        width: 100%
        top: 80px
        bottom: 170px
        white-space: nowrap
        font-size: 0
        .middle-l
          display: inline-block
          vertical-align: top
          position: relative
          width: 100%
          height: 0
          padding-top: 80%
          .cd-wrapper
            position: absolute
            left: 10%
            top: 0
            width: 80%
            box-sizing: border-box
            height: 100%
            .cd
              width: 100%
              height: 100%
              border-radius: 50%
              .image
                position: absolute
                left: 0
                top: 0
                width: 100%
                height: 100%
                box-sizing: border-box
                border-radius: 50%
                border: 10px solid rgba(255, 255, 255, 0.1)
              .play
                animation: rotate 20s linear infinite
          .playing-lyric-wrapper
            width: 80%
            margin: 30px auto 0 auto
            overflow: hidden
            text-align: center
            .playing-lyric
              height: 20px
              line-height: 20px
              font-size: $font-size-medium
              linear-gradient()
              animation: mask-animation 4s linear infinite alternate
            .paused
              animation-play-state: paused
        .middle-r
          display: inline-block
          vertical-align: top
          width: 100%
          height: 100%
          overflow: hidden
          .lyric-wrapper
            width: 80%
            margin: 0 auto
            overflow: hidden
            text-align: center
            .text
              line-height: 32px
              color: $color-text-l
              font-size: $font-size-medium
              &.current
                linear-gradient()
                font-size: $font-size-medium-x
                animation: mask-animation 4s linear infinite alternate
              &.paused
                animation-play-state: paused
      .bottom
        position: absolute
        bottom: 50px
        width: 100%
        .dot-wrapper
          text-align: center
          font-size: 0
          .dot
            display: inline-block
            vertical-align: middle
            margin: 0 4px
            width: 8px
            height: 8px
            border-radius: 50%
            background: $color-text-l
            &.active
              width: 20px
              border-radius: 5px
              background: $color-text-ll
        .progress-wrapper
          display: flex
          align-items: center
          width: 90%
          margin: 0px auto
          padding: 10px 0
          .time
            color: $color-text
            font-size: $font-size-small
            flex: 0 0 44px
            line-height: 30px
            width: 30px
            &.time-l
              text-align: left
            &.time-r
              text-align: right
          .progress-bar-wrapper
            flex: 1
        .operators
          display: flex
          align-items: center
          .icon
            flex: 1
            color: $color-theme
            &.disable
              color: $color-theme-d
            i
              font-size: 30px
          .i-left
            text-align: right
          .i-center
            padding: 0 20px
            text-align: center
            i
              font-size: 40px
          .i-right
            text-align: left
          .icon-favorite
            color: $color-sub-theme
      &.normal-enter-active, &.normal-leave-active
        transition: all .4s
        .top, .bottom
          transition: all .4s cubic-bezier(0.86, 0.18, 0.82, 1.32)
      &.normal-enter, &.normal-leave-to
        opacity: 0
        .top
          transform: translate3d(0, -100px, 0)
        .bottom
          transform: translate3d(0, 100px, 0)
    .mini-player
      display: flex
      align-items: center
      position: fixed
      left: 0
      bottom: 0
      z-index: 180
      width: 100%
      height: 60px
      background: $color-highlight-background
      &.mini-enter-active, &.mini-leave-active
        transition: all 0.4s
      &.mini-enter, &.mini-leave-to
        opacity: 0
      .icon
        flex: 0 0 40px
        width: 40px
        height: 40px
        padding: 0 10px 0 20px
        &.scale
          animation: scale .3s ease-out
        .imgWrapper
          height: 100%
          width: 100%
          img
            border-radius: 50%
            &.play
              animation: rotate 20s linear infinite
      .text
        display: flex
        flex-direction: column
        justify-content: center
        flex: 1
        line-height: 20px
        overflow: hidden
        .name
          margin-bottom: 2px
          no-wrap()
          font-size: $font-size-medium
          color: $color-text
        .desc
          no-wrap()
          font-size: $font-size-small
          color: $color-text-d
      .control
        flex: 0 0 30px
        width: 30px
        padding: 0 10px
        .icon-play-mini, .icon-pause-mini, .icon-playlist
          font-size: 30px
          color: $color-theme-d
        .icon-playlist
          vertical-align: 4px
        .icon-mini
          font-size: 32px
          position: absolute
          left: 0
          top: 0

  @keyframes rotate
    0%
      transform: rotate(0)
    100%
      transform: rotate(360deg)
  @keyframes scale
    50%
      transform: scale(1.5)
    100%
      transform: scale(1)
  @keyframes mask-animation
    0%
      background-position: 0 0
    100%
      background-position: -100% 0
</style>
