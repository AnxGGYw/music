<template>
  <scroll ref="suggest"
          class="suggest"
          :data="result"
          :pullup="pullup"
          :beforeScroll="beforeScroll"
          @scrollToEnd="searchMore"
          @beforeScroll="startScroll"
  >
    <ul class="suggest-list">
      <li
        @click="selectItem(item)"
        class="suggest-item"
        v-for="(item, index) in result"
        :key="index">
          <div class="icon">
            <i :class="getIconClass(item)"></i>
          </div>
          <div class="name">
            <p class="text" v-html="getDisplayName(item)"></p>
          </div>
      </li>
      <loading v-show="hasMore" title=""></loading>
    </ul>
    <div v-show="!hasMore && !result.length" class="no-result-wrapper">
      <no-result :title="noResult"></no-result>
    </div>
  </scroll>
</template>

<script type="text/ecmascript-6">
import Scroll from 'base/scroll/scroll'
import Loading from 'base/loading/loading'
import Singer from 'common/entity/singer'
import NoResult from 'base/no-result/no-result'
import { search } from 'api/search'
import { createSong, isPassValid, supplementSongsPurl } from 'common/entity/song'
import { isEqualSuccessCode } from 'common/js/util'
import { mapMutations, mapActions } from 'vuex'

const perpage = 20
const TYPE_SINGER = 'singer'
const NO_RESULT = '抱歉，暂无搜索结果'

export default {
  props: {
    query: {
      type: String,
      default: ''
    },
    showSinger: {
      type: Boolean,
      default: true
    }
  },
  created() {
    this.noResult = NO_RESULT
  },
  data() {
    return {
      page: 1,
      result: [],
      pullup: true,
      hasMore: true,
      beforeScroll: true,
      firstRequest: true
    }
  },
  methods: {
    async search() {
      this.page = 1
      this.hasMore = true
      this.$refs['suggest'].scrollTo(0, 0)
      const res = await search(this.query, this.page, this.showSinger, perpage)
      if (isEqualSuccessCode(res.code)) {
        this.result = await this._normalizeSearch(res.data)
        this._checkMore(res.data)
      }
      this.firstRequest = false
    },
    async searchMore() {
      if (!this.hasMore) {
        return
      }
      this.page++
      const res = await search(this.query, this.page, this.showSinger, perpage)
      if (isEqualSuccessCode(res.code)) {
        this.result = this.result.concat(await this._normalizeSearch(res.data))
        this._checkMore(res.data)
      }
    },
    getIconClass(item) {
      return item.type === TYPE_SINGER ? 'icon-mine' : 'icon-music'
    },
    getDisplayName(item) {
      return item.type === TYPE_SINGER ? item.singername : `${item.name}-${item.singer}`
    },
    selectItem(item) {
      if (item.type === TYPE_SINGER) {
        const singer = new Singer({
          mid: item.singermid,
          name: item.singername
        })
        this.$router.push({
          path: `/search/${singer.mid}`
        })
        this.setSinger(singer)
      } else {
        this.insertSong(item)
      }
      this.$emit('select')
    },
    refresh() {
      this.$refs['suggest'].refresh()
    },
    startScroll() {
      this.$emit('startScroll')
    },
    _checkMore(data) {
      const song = data.song
      if (!song.list.length || (song.curnum + song.curpage * perpage) >= song.totalnum) {
        this.hasMore = false
      }
    },
    async _normalizeSearch(data) {
      let result = []
      if (data.zhida && data.zhida.singerid && this.firstRequest) {
        result.push({...data.zhida, ...{'type': TYPE_SINGER}})
      }
      const songs = await supplementSongsPurl(this._normalizeSongs(data.song.list))
      return result.concat(songs)
    },
    _normalizeSongs(list) {
      let result = []
      list.forEach((musicData) => {
        if (isPassValid(musicData)) {
          result.push(createSong(musicData))
        }
      })
      return result
    },
    ...mapMutations({
      'setSinger': 'SET_SINGER'
    }),
    ...mapActions([
      'insertSong'
    ])
  },
  watch: {
    query() {
      this.search()
    }
  },
  components: {
    Scroll,
    Loading,
    NoResult
  }
}
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"
  @import "~common/stylus/mixin"

  .suggest
    height: 100%
    overflow: hidden
    .suggest-list
      padding: 0 30px
      .suggest-item
        display: flex
        align-items: center
        padding-bottom: 20px
      .icon
        flex: 0 0 30px
        width: 30px
        [class^="icon-"]
          font-size: 14px
          color: $color-text-d
      .name
        flex: 1
        font-size: $font-size-medium
        color: $color-text-d
        overflow: hidden
        .text
          no-wrap()
    .no-result-wrapper
      position: absolute
      width: 100%
      top: 50%
      transform: translateY(-50%)
</style>
