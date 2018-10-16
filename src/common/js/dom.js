// 是否存在样式
export const hasClass = (el, className = '') => {
  if (_compatibleClassList) {
    return el.classList.contains(className)
  } else {
    let reg = new RegExp(`(^|\\s)${className}(\\s|$)`)
    return reg.test(el.className)
  }
}

// 添加样式
export const addClass = (el, className = '') => {
  if (_compatibleClassList) {
    return el.classList.add(className)
  } else {
    if (!hasClass(el, className)) {
      let newClass = el.className.split(' ')
      newClass.push(className)
      el.className = newClass.join(' ')
    }
  }
}

// 删除样式
export const removeClass = (el, className = '') => {
  if (_compatibleClassList) {
    return el.classList.remove(className)
  } else {
    if (!hasClass(el, className)) return
    let classNameArr = el.className.split(' ')
    classNameArr.splice(classNameArr.findIndex(item => {
      return item === className
    }), 1)
    el.className = classNameArr.join(' ')
  }
}

// 获取data-xxx属性的值
export const getData = (el, name) => {
  return el.getAttribute(`data-${name}`)
}

// 获取元素相对于窗口的位置
export const getElementPosition = (element) => {
  let rect = element.getBoundingClientRect()
  return {
    top: rect.top,
    right: rect.right,
    bottom: rect.bottom,
    left: rect.left
  }
}

// 浏览器性能检测
let _elementStyle = document.createElement('div').style
let _vendor = (() => {
  let transformNames = {
    'webkit': 'webkitTransform',
    'Moz': 'MozTransform',
    'O': 'OTransform',
    'ms': 'msTransform',
    'standard': 'transform'
  }
  for (let key in transformNames) {
    if (transformNames.hasOwnProperty(key)) {
      if (_elementStyle[transformNames[key]] !== undefined) {
        return key
      }
    }
  }
  return false
})()

// 根据浏览器性能加前缀
export const prefixStyle = (style) => {
  if (!_vendor) {
    return false
  }
  if (_vendor === 'standard') {
    return style
  }
  return _vendor + style.charAt(0).toUpperCase() + style.substring(1)
}

// 检测浏览器是否支持classList
const _compatibleClassList = (() => {
  return 'classList' in document.documentElement
})()