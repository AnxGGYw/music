<template>
  <div class="loading">
    <div class="loading-item" v-for="(item, index) in reverseText" :key="index" ref="loading-item">{{item}}</div>
  </div>
</template>

<script>

const perDelay = 0.15

export default {
  mounted () {
    let items = this.$refs['loading-item']
    let delay = 0
    let i = 1
    for (; i < items.length; i++) {
      delay += perDelay
      items[i].style.animationDelay = `${delay}s`
    }
  },
  computed: {
    reverseText () {
      return Array.from(this.title).reverse()
    }
  },
  props: {
    title: {
      type: String,
      default: () => 'Loading'
    }
  }
}
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
@import "~common/stylus/variable"
.loading
  width: 100%
  height: 36px
  .loading-item
    position: absolute
    width: 20px
    height: 36px
    opacity: 0
    font-family: Helvetica, Arial, sans-serif
    animation: enter 1.8s linear infinite
    transform: rotate(180deg)
    color: $color-text-ll
@keyframes enter
  0%
    left: 0
    opacity: 0
  35%
    left: 41%
    transform: rotate(0deg)
    opacity: 1
  65%
    left: 59%
    transform: rotate(0deg)
    opacity: 1
  100%
    left: 100%
    transform: rotate(-180deg)
    opacity: 0
</style>
