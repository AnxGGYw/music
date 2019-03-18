<template>
  <div class="search">
    <div class="search-box-wrapper">
      <search-box ref="searchBox" @query="onQueryChange"></search-box>
    </div>
    <div class="shortcut-wrapper" v-show="!query" ref="shortcutWrapper">
      <scroll class="shortcut" :data="shortcut" ref="shortcut" :refreshDelay="refreshDelay">
        <div>
          <div class="hot-key">
            <h1 class="title">{{hotSearchText}}</h1>
            <ul>
              <li
                class="item"
                @click="addQuery(item.k)"
                v-for="(item, index) in hotKey"
                :key="index"
              >
                <span>{{item.k}}</span>
              </li>
            </ul>
          </div>
          <div class="search-history" v-show="searchHistory.length">
            <h1 class="title">
              <span class="text">{{searchHistoryText}}</span>
              <span class="clear" @click="showConfirm">
                <i class="icon-clear"></i>
              </span>
            </h1>
            <search-list
              :searches="searchHistory"
              @select="addQuery"
              @delete="deleteSearchHistory"
            ></search-list>
          </div>
        </div>
      </scroll>
    </div>
    <div class="search-result" v-show="query" ref="searchResult">
      <suggest
        ref="suggest"
        :query="query"
        @select="saveSearch"
        @startScroll="blur"
      ></suggest>
    </div>
    <confirm
      ref="confirm"
      :text="confirmText"
      :confirmBtnText="confirmBtnText"
      @confirm="clearSearchHistory"
    ></confirm>
    <router-view></router-view>
  </div>
</template>

<script type="text/ecmascript-6">
import SearchBox from 'base/search-box/search-box'
import Suggest from 'components/suggest/suggest'
import SearchList from 'base/search-list/search-list'
import Confirm from 'base/confirm/confirm'
import Scroll from 'base/scroll/scroll'
import { getHotKey } from 'api/search'
import { isEqualSuccessCode } from 'common/js/util'
import { mapActions, mapGetters } from 'vuex'
import { playListMixin, searchMixin } from 'common/js/mixin'

const HOT_KEY_LENGTH = 10

export default {
  mixins: [playListMixin, searchMixin],
  created() {
    this._getHotKey()
    this.confirmText = '是否清空所有搜索历史 ？'
    this.confirmBtnText = '清空'
    this.hotSearchText = '热门搜索'
    this.searchHistoryText = '搜索历史'
  },
  data() {
    return {
      hotKey: []
    }
  },
  computed: {
    shortcut() {
      return this.hotKey.concat(this.searchHistory)
    },
    ...mapGetters([
      'searchHistory'
    ])
  },
  methods: {
    handlePlayList(playList) {
      const bottom = playList.length ? '60px' : ''
      this.$refs['shortcutWrapper'].style.bottom = bottom
      this.$refs['searchResult'].style.bottom = bottom
      this.$refs['shortcut'].refresh()
      this.$refs['suggest'].refresh()
    },
    showConfirm() {
      this.$refs['confirm'].show()
    },
    async _getHotKey() {
      const res = await getHotKey()
      if (isEqualSuccessCode(res.code)) {
        this.hotKey = res.data.hotkey.slice(0, HOT_KEY_LENGTH)
      }
    },
    ...mapActions([
      'saveSearchHistory',
      'deleteSearchHistory',
      'clearSearchHistory'
    ])
  },
  watch: {
    query(newQuery) {
      if (!newQuery) {
        setTimeout(() => {
          this.$refs['shortcut'].refresh()
        }, 20)
      }
    }
  },
  components: {
    SearchBox,
    Suggest,
    SearchList,
    Confirm,
    Scroll
  }
}
</script>

<style lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"
  @import "~common/stylus/mixin"

  .search
    .search-box-wrapper
      margin: 20px
    .shortcut-wrapper
      position: fixed
      top: 178px
      bottom: 0
      width: 100%
      .shortcut
        height: 100%
        overflow: hidden
        .hot-key
          margin: 0 20px 20px 20px
          .title
            margin-bottom: 20px
            font-size: $font-size-medium
            color: $color-text-l
          .item
            display: inline-block
            padding: 5px 10px
            margin: 0 20px 10px 0
            border-radius: 6px
            background: $color-highlight-background
            font-size: $font-size-medium
            color: $color-text-d
        .search-history
          position: relative
          margin: 0 20px
          .title
            display: flex
            align-items: center
            height: 40px
            font-size: $font-size-medium
            color: $color-text-l
            .text
              flex: 1
            .clear
              extend-click()
              .icon-clear
                font-size: $font-size-medium
                color: $color-text-d
    .search-result
      position: fixed
      width: 100%
      top: 178px
      bottom: 0
</style>
