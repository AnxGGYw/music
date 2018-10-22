<template>
  <scroll
    class="listview"
    :data="data"
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
    <div class="loading-container" v-if="!data.length">
      <loading></loading>
    </div>
  </scroll>
</template>

<script type="text/ecmascript-6">
import Scroll from 'base/scroll/scroll'
import Loading from 'base/loading/loading'

export default {
  props: {
    data: {
      type: Array,
      default: () => [],
      delta: 0
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
