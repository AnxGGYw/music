<template>
  <div class="slider" ref="slider">
    <div class="slider-group" ref="sliderGroup">
      <slot>
      </slot>
    </div>
    <div class="dots">
      <span class="dot"
        v-for="(item, index) in dots"
        :key="index"
        :class="{'active': currIndex === index}"
      >
      </span>
    </div>
  </div>
</template>

<script type="text/ecmascript-6">
import BScroll from 'better-scroll'
import { addClass } from 'common/js/dom'

export default {
  data() {
    return {
      dots: [],
      currIndex: 0
    }
  },
  props: {
    loop: {
      type: Boolean,
      default: true
    },
    autoPlay: {
      type: Boolean,
      default: true
    },
    interval: {
      type: Number,
      default: 4000
    }
  },
  mounted() {
    setTimeout(() => {
      this._setSliderWidth()
      this._initDots()
      this._initSlider()
      if (this.autoPlay) {
        this._play()
      }
    }, 20)

    window.addEventListener('resize', () => {
      if (this.slider) {
        this._setSliderWidth(true)
        this.slider.refresh()
      }
    })
  },
  methods: {
    // set the width of the sliderWidth, in order to initialize the better-scroll
    _setSliderWidth(isResize) {
      const childList = this.child = this.$refs['sliderGroup'].children // sliderGroup all child elements
      const sliderWidth = this.$refs['slider'].clientWidth // slider width (width of each child)
      let groupWidth = 0 // the totalWidth of the sliderGroup after calculation
      for (let el of childList) {
        addClass(el, 'slider-item')
        el.style.width = `${sliderWidth}px`
        groupWidth += sliderWidth
      }
      if (this.loop && !isResize) {
        groupWidth += 2 * sliderWidth
      }
      this.$refs['sliderGroup'].style.width = `${groupWidth}px`
    },
    // initialize slot
    _initDots() {
      this.dots = new Array(this.child.length)
    },
    // initialize the better-scroll
    _initSlider() {
      this.slider = new BScroll(this.$refs['slider'], {
        scrollX: true, /* 允许横向滚动 */
        scrollY: false, /* 禁止纵向滚动 */
        momentum: false, /* 当快速滑动时是否开启滑动惯性 */
        snap: true, /* 该属性是给 slider 组件使用的，普通的列表滚动不需要配置 */
        snapLoop: this.loop, /* 是否可以无缝循环轮播 设置为true会克隆2个dom元素 */
        snapThreshold: 0.3, /* 0.1 用手指滑动时页面可切换的阈值，大于这个阈值可以滑动的下一页 */
        snapSpeed: 400 /* 轮播图切换的动画时间 */
      })
      // 滚动结束会触发better-scroll插件的scrollEnd事件,回调函数通过getCurrentPage().pageX可以拿到当前滚动的index
      this.slider.on('scrollEnd', () => {
        let index = this.slider.getCurrentPage().pageX
        if (this.loop) { // 如果是无缝循环轮播 因为会克隆2个dom元素 所以当前的index要减1
          index -= 1
        }
        this.currIndex = index
        // 如果自动轮播 先清除timer 避免手滑动切换end后马上又触发timer
        if (this.autoPlay) {
          clearTimeout(this.timer)
          this._play()
        }
      })
    },
    _play() {
      let index = this.currIndex + 1
      if (this.loop) {
        index += 1
      }
      this.timer = setInterval(() => {
        this.slider.goToPage(index, 0, 400)
      }, this.interval)
    }
  },
  destroyed() {
    clearTimeout(this.timer)
  }
}
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"
  .slider
    min-height: 1px
    .slider-group
      position: relative
      overflow: hidden
      white-space: nowrap
      .slider-item
        float: left
        box-sizing: border-box
        overflow: hidden
        text-align: center
        a
          display: block
          width: 100%
          overflow: hidden
          text-decoration: none
        img
          display: block
          width: 100%
    .dots
      position: absolute
      right: 0
      left: 0
      bottom: 12px
      text-align: center
      font-size: 0
      .dot
        display: inline-block
        margin: 0 4px
        width: 8px
        height: 8px
        border-radius: 50%
        background: $color-text-l
        &.active
          width: 20px
          border-radius: 5px
          background: $color-text-ll
</style>
