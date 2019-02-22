<template>
  <div class="singer">
    <list-view :data="singers" @clickItem="clickSinger" ref="singerList"></list-view>
  </div>
</template>

<script type="text/ecmascript-6">
import Singer from 'common/entity/singer'
import ListView from 'base/listView/listView'
import { mapMutations } from 'vuex'
import { getSingerList } from 'api/singer'

const HOT_NAME = '热'
const HOT_SINGER_NUM = 10

export default {
  data() {
    return {
      singers: []
    }
  },
  created() {
    this._getSingerList()
  },
  methods: {
    clickSinger(singer) {
      this.$router.push({
        path: `/singer/${singer.mid}`
      })
      this.setSinger(singer)
    },
    async _getSingerList() {
      let list = []
      let res = await Promise.all([getSingerList(1), getSingerList(2)]) // 分页 200 条数据
      res.forEach(item => {
        list.push(...item.data.list)
      })
      this.singers = this._normalizeSingers(list)
    },
    _normalizeSingers(list) {
      let map = {
        'hot': {
          title: HOT_NAME,
          items: []
        }
      }
      list.forEach((ele, index) => {
        if (index < HOT_SINGER_NUM) {
          map.hot.items.push(new Singer({
            mid: ele.Fsinger_mid,
            name: ele.Fsinger_name
          }))
        }
        const fIndex = ele.Findex // 首字母
        if (!map[fIndex]) {
          map[fIndex] = {
            title: fIndex,
            items: []
          }
        }
        map[fIndex].items.push(new Singer({
          mid: ele.Fsinger_mid,
          name: ele.Fsinger_name
        }))
      })
      // js 遍历对象不能保证顺序, 这里需要转换成数组
      let hotArr = []
      let othersArr = []
      for (let key in map) {
        if (map.hasOwnProperty(key)) {
          let value = map[key]
          if (value.title.includes(HOT_NAME)) {
            hotArr.push(value)
          } else if (/[a-zA-Z]/.test(value.title)) {
            othersArr.push(value)
          }
        }
      }
      othersArr.sort((a, b) => {
        return a.title.charCodeAt(0) - b.title.charCodeAt(0)
      })
      return hotArr.concat(othersArr)
    },
    ...mapMutations({
      setSinger: 'SET_SINGER'
    })
  },
  components: {
    ListView
  }
}
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
.singer {
  position: fixed;
  top: 88px;
  bottom: 0;
  width: 100%;
}
</style>
