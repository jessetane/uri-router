var proto = Object.create(window.HTMLElement.prototype)

proto.createdCallback = function () {
  console.log('web-component lifecycle: createdCallback')
  var shadow = this.createShadowRoot()
  shadow.innerHTML = require('./index.html')
}

proto.attachedCallback = function () {
  console.log('web-component lifecycle: attachedCallback')
}

proto.detachedCallback = function () {
  console.log('web-component lifecycle: detachedCallback')
}

module.exports = document.registerElement('web-component', {
  prototype: proto
})
