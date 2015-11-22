module.exports = function () {
  return document.createElement('web-component')
}

var inherits = require('inherits')

inherits(WebComponent, window.HTMLElement)

function WebComponent () {}

WebComponent.prototype.createdCallback = function () {
  console.log('web-component lifecycle: createdCallback')
  var shadow = this.createShadowRoot()
  shadow.innerHTML = require('./index.html')
}

WebComponent.prototype.attachedCallback = function () {
  console.log('web-component lifecycle: attachedCallback')
}

WebComponent.prototype.detachedCallback = function () {
  console.log('web-component lifecycle: detachedCallback')
}

if (document.registerElement) {
  document.registerElement('web-component', WebComponent)
} else {
  console.warn('your browser does not support web components')
}
