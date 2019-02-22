<template>
  <scroll
    class="listview"
    :data="data"
    ref="listview"
    :listenScroll="listenScroll"
    :probeType="probeType"
    @scroll="emitScroll"
  >
    <ul>
      <li
        class="list-group"
        v-for="(groups, index) in data"
        :key="index"
        ref="listGroup"
      >
        <h2 class="list-group-title">{{groups.title}}</h2>
        <ul>
          <li
            @click="clickItem(item)"
            class="list-group-item"
            v-for="(item, index) in groups.items"
            :key="index"
          >
            <img class="avatar" v-lazy="item.avatar" alt="">
            <span class="name">{{item.name}}</span>
          </li>
        </ul>
      </li>
    </ul>
    <div
      class="list-shortcut"
      @touchstart="onShortCutTouchStart"
      @touchmove.stop.prevent="onShortCutTouchMove"
      @touchend="onShortCutTouchEnd"
      ref="listShortCut"
    >
      <ul>
        <li
          class="item"
          v-for="(item, index) in shortCutList"
          :key="index"
          :data-index="index"
          :class="{ 'current': index === currentIndex }"
        >
          {{item}}
        </li>
      </ul>
    </div>
    <div class="list-fixed" v-if="fixedTitle" ref="listFixed">
      <h1 class="fixed-title">{{fixedTitle}}</h1>
    </div>
    <div class="bubble-container" ref="bubble-container">
      <div class="bubble-image"></div>
      <span class="text">{{fixedTitle}}</span>
    </div>
    <div class="loading-container" v-if="!data.length">
      <loading></loading>
    </div>
  </scroll>
</template>

<script type="text/ecmascript-6">
import Scroll from 'base/scroll/scroll'
import Loading from 'base/loading/loading'
import { getData, addClass, removeClass, getElementPosition } from 'common/js/dom'

const APP_HEIGHT = 88
const ANCHOR_HEIGHT = 18
const SHORT_CUT_PADDING = 20
const VIBRATION_DURATION = 10
const FIXED_TITLE_HEIGHT = 24

export default {
  created() {
    this.touch = {}
    this.listenScroll = true
    this.probeType = 3
    this.heightList = []
    this.isShowBubble = false
    this.vibrate = 'vibrate' in navigator
  },
  computed: {
    shortCutList() {
      return this.data.map(item => {
        return item.title.substring(0, 1)
      })
    },
    fixedTitle() {
      if (this.scrollY > 0) return ''
      let data = this.data[this.currentIndex]
      return data ? data.title.substring(0, 1) : ''
    }
  },
  props: {
    data: {
      type: Array,
      default: () => [],
      delta: 0
    }
  },
  data() {
    return {
      currentIndex: 0,
      scrollY: -1,
      diff: 0
    }
  },
  methods: {
    clickItem(item) {
      this.$emit('clickItem', item)
    },
    onShortCutTouchStart(e) {
      const anchorIndex = getData(e.target, 'index')
      this.touch.oldY = e.touches[0].pageY | 0
      this.touch.anchorIndex = anchorIndex
      this._scrollTo(anchorIndex)
      const bubbleContainer = this.$refs['bubble-container']
      bubbleContainer.style.transition = 'opacity 1.5s'
      addClass(bubbleContainer, 'active')
      this._updateBubbleContainer()
    },
    onShortCutTouchMove(e) {
      this.touch.newY = e.touches[0].pageY | 0
      let { top, bottom } = getElementPosition(this.$refs['listShortCut'])
      if (this.touch.newY <= top + SHORT_CUT_PADDING || this.touch.newY >= bottom - SHORT_CUT_PADDING) {
        return
      }
      let deltaY = this.touch.newY - this.touch.oldY
      // Browser that supports the vibration API, the phone vibrates for 10 milliseconds
      if (this.vibrate && deltaY % ANCHOR_HEIGHT === 0) {
        navigator.vibrate(VIBRATION_DURATION)
      }
      let deltaIndex = (deltaY / ANCHOR_HEIGHT) | 0
      let anchorIndex = parseInt(this.touch.anchorIndex) + deltaIndex
      this._scrollTo(anchorIndex)
      this._updateBubbleContainer(this.touch.newY)
    },
    onShortCutTouchEnd() {
      removeClass(this.$refs['bubble-container'], 'active')
    },
    emitScroll(pos) {
      this.scrollY = pos.y
    },
    refresh() {
      this.$refs['listview'].refresh()
    },
    _calculateHeight() {
      this.heightList = []
      let list = this.$refs['listGroup']
      let height = 0
      this.heightList.push(height)
      for (let item of list) {
        height += item.clientHeight
        this.heightList.push(height)
      }
    },
    _scrollTo(index) {
      if (!index && index !== 0) return
      if (index < 0) index = 0
      if (index > this.heightList.length - 2) index = this.heightList - 2
      this.scrollY = -this.heightList[index]
      this.$refs['listview'].scrollToElement(this.$refs['listGroup'][index], 0)
    },
    _updateBubbleContainer(value = this.touch.oldY) {
      this.$refs['bubble-container'].style.top = `${value - APP_HEIGHT - (this.$refs['bubble-container'].clientHeight / 2)}px`
    }
  },
  watch: {
    data() {
      setTimeout(() => {
        this._calculateHeight()
      }, 20)
    },
    scrollY(newY) {
      const heightList = this.heightList
      // scroll to the top, newY > 0
      if (newY > 0) {
        this.currentIndex = 0
        return
      }
      // scroll to the middle
      for (let i = 0, height = heightList.length - 1; i < height; i++) {
        let topHeight = heightList[i]
        let buttomHeight = heightList[i + 1]
        if (-newY >= topHeight && -newY < buttomHeight) {
          this.currentIndex = i
          this.diff = buttomHeight + newY
          return
        }
      }
      // scroll to the bottom
      this.currentIndex = heightList.length - 2
    },
    diff(newValue) {
      let fixedTop = Math.floor(newValue) < FIXED_TITLE_HEIGHT ? Math.floor(newValue) - FIXED_TITLE_HEIGHT : 0
      if (this.fixedTop === fixedTop) return
      this.fixedTop = fixedTop
      this.$refs['listFixed'].style.transform = `translate3d(0, ${fixedTop}px, 0)`
    }
  },
  components: {
    Scroll,
    Loading
  }
}
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"
  .listview
    position: relative
    width: 100%
    height: 100%
    overflow: hidden
    background: $color-background
    .list-group
      padding-bottom: 30px
      .list-group-title
        height: 24px
        line-height: 24px
        padding-left: 20px
        font-size: $font-size-small
        color: $color-text-l
        background: $color-highlight-background
      .list-group-item
        display: flex
        align-items: center
        padding: 20px 0 0 30px
        .avatar
          width: 50px
          height: 50px
          border-radius: 50%
        .name
          margin-left: 20px
          color: $color-text-l
          font-size: $font-size-medium
    .list-shortcut
      position: absolute
      z-index: 30
      right: 2px
      top: 50%
      transform: translateY(-50%)
      width: 20px
      padding: 20px 0
      border-radius: 10px
      text-align: center
      background: $color-background-d
      font-family: Helvetica
      .item
        padding: 3px
        line-height: 1
        color: $color-text-l
        font-size: $font-size-small
        &.current
          color: $color-theme
    .list-fixed
      position: absolute
      top: 0
      left: 0
      width: 100%
      .fixed-title
        height: 24px
        line-height: 24px
        padding-left: 20px
        font-size: $font-size-small
        color: $color-theme
        background: $color-highlight-background
    .loading-container
      position: absolute
      width: 100%
      top: 50%
      transform: translateY(-50%)
    .bubble-container
      position: absolute
      right: 46px
      top: 54px
      opacity: 0
      &.active
        opacity: 1
      .bubble-image
        position relative
        background: url('bubble.png')
        background-size: 100%
        width: 46px
        height: 46px
      .text
        position: absolute
        top: 50%
        left: 50%
        color: $color-theme
        transform: translate3d(-50%, -50%, 0)
        font-size: 20px
</style>
