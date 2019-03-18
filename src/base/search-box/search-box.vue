<template>
  <div class="search-box">
    <i class="icon-search"></i>
    <input v-model="query" class="box" :placeholder="placeholder" ref="query"/>
    <i @click="clear" v-show="query" class="icon-delete"></i>
  </div>
</template>

<script type="text/ecmascript-6">
import { debounce } from 'common/js/util'

const SEARCH_DEFAULT_MSG = '搜索歌手、歌曲'

export default {
  props: {
    placeholder: {
      type: String,
      default: SEARCH_DEFAULT_MSG
    }
  },
  created() {
    this.$watch('query', debounce((newQuery) => {
      this.$emit('query', newQuery.trim())
    }, 300))
  },
  data() {
    return {
      query: ''
    }
  },
  methods: {
    clear() {
      this.query = ''
    },
    setQuery(query) {
      this.query = query
    },
    blur() {
      this.$refs['query'].blur()
    }
  }
}
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"

  .search-box
    display: flex
    align-items: center
    box-sizing: border-box
    width: 100%
    padding: 0 6px
    height: 40px
    background: $color-highlight-background
    border-radius: 6px
    .icon-search
      font-size: 24px
      color: $color-background
    .box
      flex: 1
      margin: 0 5px
      line-height: 18px
      background: $color-highlight-background
      color: $color-text
      font-size: $font-size-medium
      outline: 0
      caret-color: $color-theme
      &::placeholder
        color: $color-text-d
    .icon-delete
      font-size: 16px
      color: $color-background
</style>
