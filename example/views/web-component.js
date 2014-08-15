var inherits = require('inherits');

module.exports = 'WEB-COMPONENT'; // export tag name for instantiating via document.createElement(tagName)

function WebComponent() {}
inherits(WebComponent, HTMLElement);

WebComponent.prototype.createdCallback = function() {
  console.log('web-component lifecycle: createdCallback');
  var shadow = this.createShadowRoot();
  shadow.innerHTML = require('../templates/web-component.html');
};

WebComponent.prototype.attachedCallback = function() {
  console.log('web-component lifecycle: attachedCallback');
};

WebComponent.prototype.detachedCallback = function() {
  console.log('web-component lifecycle: detachedCallback');
};

if (document.registerElement) {
  document.registerElement('web-component', WebComponent);
}
else {
  console.warn('your browser does not support web components');
}
