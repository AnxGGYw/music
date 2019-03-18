import { commonParams } from './config'
import { getUid } from 'common/js/uid'
import { isEqualSuccessCode } from 'common/js/util'
import axios from 'axios'

export const getSongsPurl = (songs) => {
  const url = '/api/getSongPurl'

  let mids = []
  let types = []

  songs.forEach((song) => {
    mids.push(song.mid)
    types.push(0)
  })

  const urlMid = genUrlMid(mids, types)
  const data = Object.assign({}, commonParams, {
    g_tk: 5381,
    format: 'json',
    platform: 'h5',
    needNewCode: 1,
    uin: 0
  })

  return new Promise((resolve, reject) => {
    let tryTime = 3 // number of attempts to request

    const retry = () => {
      if (--tryTime >= 0) {
        requestUrl()
      } else {
        reject(new Error('Can not get the songs url'))
      }
    }
    const requestUrl = async () => {
      const response = await axios.post(url, {
        comm: data,
        url_mid: urlMid
      })
      const res = response.data
      if (isEqualSuccessCode(res.code)) {
        let urlMid = res.url_mid
        if (urlMid && isEqualSuccessCode(urlMid.code)) {
          const info = urlMid.data.midurlinfo[0]
          if (info && info.purl) {
            resolve(res)
          } else {
            retry()
          }
        } else {
          retry()
        }
      } else {
        retry()
      }
    }
    requestUrl()
  })
}

const genUrlMid = (mids, types) => {
  const guid = getUid()
  return {
    method: 'CgiGetVkey',
    module: 'vkey.GetVkeyServer',
    param: {
      guid,
      songmid: mids,
      songtype: types,
      uin: '0',
      loginflag: 0,
      platform: '23'
    }
  }
}

export const getLyric = (mid) => {
  const url = '/api/getLyric'

  const data = Object.assign({}, commonParams, {
    songmid: mid,
    pcachetime: +new Date(),
    platform: 'yqq',
    hostUin: 0,
    needNewCode: 0,
    format: 'json'
  })
  return axios.get(url, {
    params: data
  }).then(res => {
    return Promise.resolve(res.data)
  })
}
