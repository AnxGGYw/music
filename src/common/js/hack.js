// hack for global nextTick
const noop = () => {}

window.MessageChannel = noop
window.setImmediate = noop
