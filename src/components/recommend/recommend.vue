<template>
  <div class="recommend" ref="recommend">
    <scroll class="recommend-content" ref="scroll" :data="discList">
      <div>
        <div class="slider-wrapper" v-if="recommendList.length">
          <slider>
            <div v-for="(item, index) in recommendList" :key="index">
              <a :href="item.linkUrl">
                <img @load="loadImage" :src="item.picUrl" alt="" class="needsclick"/>
              </a>
            </div>
          </slider>
        </div>
        <div class="recommend-list">
          <h1 class="list-title">{{title}}</h1>
          <ul>
            <li
              v-for="(item, index) in discList"
              :key="index"
              class="item"
              @click="selectItem(item)"
            >
              <div class="icon">
                <img v-lazy="item.imgurl" width="60" height="60"/>
              </div>
              <div class="text">
                <h2 class="name" v-html="item.creator.name"></h2>
                <p class="desc" v-html="item.dissname"></p>
              </div>
            </li>
          </ul>
        </div>
      </div>
      <div class="loading-container" v-if="!discList.length">
        <loading></loading>
      </div>
    </scroll>
  </div>
</template>

<script>
import Slider from 'base/slider/slider'
import Scroll from 'base/scroll/scroll'
import Loading from 'base/loading/loading'
import { getRecommendList, getDiscList } from 'api/recommend'
import { isEqualSuccessCode } from 'common/js/util'

export default {
  data() {
    return {
      recommendList: [],
      discList: []
    }
  },
  created() {
    this.title = '热门歌单推荐'
    this._getRecommendList()
    this._getDiscList()
  },
  methods: {
    loadImage() {
      if (!this.checkloaded) {
        this.checkloaded = true
        setTimeout(() => {
          this.$refs['scroll'].refresh()
        }, 20)
      }
    },
    async _getRecommendList() {
      let res = await getRecommendList()
      if (isEqualSuccessCode(res.code)) {
        this.recommendList = res.data.slider
      }
    },
    async _getDiscList() {
      let res = await getDiscList()
      if (isEqualSuccessCode(res.code)) {
        this.discList = res.data.list
      }
    }
  },
  components: {
    Slider,
    Scroll,
    Loading
  }
}
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"
  .recommend
    position: fixed
    width: 100%
    top: 88px
    bottom: 0
    .recommend-content
      height: 100%
      overflow: hidden
      .slider-wrapper
        position: relative
        width: 100%
        overflow: hidden
      .recommend-list
        .list-title
          height: 65px
          line-height: 65px
          text-align: center
          font-size: $font-size-medium
          color: $color-theme
        .item
          display: flex
          box-sizing: border-box
          align-items: center
          padding: 0 20px 20px 20px
          .icon
            flex: 0 0 60px
            width: 60px
            padding-right: 20px
            img
              border-radius 50%
          .text
            display: flex
            flex-direction: column
            justify-content: center
            flex: 1
            line-height: 20px
            overflow: hidden
            font-size: $font-size-medium
            .name
              margin-bottom: 10px
              color: $color-text
            .desc
              color: $color-text-d
      .loading-container
        position: absolute
        width: 100%
        top: 50%
        transform: translateY(-50%)
</style>
