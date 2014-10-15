(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
window.router = require('../');

router({
  watch: 'pathname',
  outlet: '.pages',
  routes: {
    '/': require('./src/home'),
    '/hash': require('./src/hash'),
    '/search': require('./src/search'),
    '/transitions(/.*)?': require('./src/transitions'),
    '/z-control(/.*)?': require('./src/z-control'),
    '/stacking(/.*)?': require('./src/stacking'),
    '/redirecting(/.*)?': require('./src/redirect'),
    '/web-components': require('./src/web-component'),
  },
  notFound: require('./src/404'),
});

},{"../":32,"./src/404":3,"./src/hash":5,"./src/home":7,"./src/redirect":9,"./src/search":13,"./src/stacking":17,"./src/transitions":20,"./src/web-component":24,"./src/z-control":26}],2:[function(require,module,exports){
module.exports = "<div>\n  <h1>404</h1>\n  <p></p>\n</div>";
},{}],3:[function(require,module,exports){
var render = require('hyperglue2');

module.exports = NotFound;

function NotFound() {
  this.el = render(require('./index.html'));
};

NotFound.prototype.show = function() {
  render(this.el, { p: window.location.href + ' was not found' });
};

},{"./index.html":2,"hyperglue2":40}],4:[function(require,module,exports){
module.exports = "<div>\n  <style>\n    .box {\n      width: 100px;\n      height: 100px;\n      border:1px solid #CCC;\n      display: inline-block;\n      margin-left: 1em;\n      vertical-align: middle;\n      position: relative;\n    }\n    .center {\n      position: relative;\n      text-align: center;\n      padding: 0;\n      margin: 0;\n      width: 100%;\n      top: 50%;\n      transform: translateY(-50%);\n    }\n  </style>\n  <h1>hash</h1>\n  <p>simple hash routing</p>\n  <ul style=\"display:inline-block; vertical-align:middle;\">\n    <li><a href=\"#one\">one</a></li>\n    <li><a href=\"#two\">two</a></li>\n    <li><a href=\"#three\">three</a></li>\n  </ul>\n  <div class=\"outlet box\"></div>\n</div>";
},{}],5:[function(require,module,exports){
var router = require('../../../');
var render = require('hyperglue2');

module.exports = HashView;

function HashView() {
  this.el = render(require('./index.html'));
  this.router = router({
    watch: 'hash',
    outlet: this.el.querySelector('.outlet'),
    routes: {
      '#one': One,
      '#two': Two,
      '#three': Three
    }
  });

  this.deselect = deselect.bind(this);
  document.addEventListener('click', this.deselect);
};

HashView.prototype.hide = function() {
  this.router.destroy();
  document.removeEventListener('click', this.deselect);
};

function deselect(evt) {
  if (evt.target.nodeName !== 'A') {
    this.router.push('');
  }
}

function One() { this.el = render('<h3 class="center">1</h3>') }
function Two() { this.el = render('<h3 class="center">2</h3>') }
function Three() { this.el = render('<h3 class="center">3</h3>') }

},{"../../../":32,"./index.html":4,"hyperglue2":40}],6:[function(require,module,exports){
module.exports = "<div>\n  <h1>home</h1>\n  <p>browse the demos by clicking the links above</p>\n</div>";
},{}],7:[function(require,module,exports){
var render = require('hyperglue2');

module.exports = function() {
  this.el = render(require('./index.html'));
};

},{"./index.html":6,"hyperglue2":40}],8:[function(require,module,exports){
module.exports = "<div>\n  <h1>redirecting</h1>\n  <p>using programmatic navigation to achieve redirect-like functionality</p>\n  <form action=\"/redirecting/protected\">\n    <button class=\"show-protected\" type=\"submit\">show protected area</button>\n  </form>\n  <div class=\"outlet\"></div>\n</div>";
},{}],9:[function(require,module,exports){
var router = require('../../../');
var render = require('hyperglue2');
var template = require('./index.html');
var templateprotected = require('./protected.html');
var templatesignin = require('./signin.html');

var user = null;

module.exports = Redirecting;

function Redirecting() {
  this.el = render(template);
};

Redirecting.prototype.show = function(r) {
  render(this.el, {
    '.show-protected': { 
      _attr: { disabled: window.location.pathname === r.route ? null : 'disabled' }
    }
  });

  if (this.router) return;

  this.router = router({
    root: r.route,
    watch: 'pathname',
    outlet: this.el.querySelector('.outlet'),
    routes: {
      '/protected': Protected,
      '/sign-in': Signin,
    }
  });
};

Redirecting.prototype.hide = function() {
  this.router.destroy();
};

function Protected() {
  var self = this;
  this.el = render(templateprotected);
  this.el.addEventListener('submit', function(evt) {
    user = null;
    self.router.pop();
  });
}

Protected.prototype.show = function(router) {
  this.router = router;
  this.el.style.display = '';
  if (!user) {
    router.push('/sign-in', true, true);  // redirect to /sign-in, replace state, and stack
  }
  else {
    render(this.el, { p: 'welcome to the protected area ' + user });
  }
};

Protected.prototype.hide = function() {
  this.el.style.display = 'none';
};

function Signin() {
  var self = this;
  this.el = render(templatesignin);
  this.el.addEventListener('submit', function(evt) {
    user = evt.target.elements[0].value;
    if (!user) return;
    self.router.pop(true);
  });
}

Signin.prototype.show = function(router) {
  this.router = router;
};

},{"../../../":32,"./index.html":8,"./protected.html":10,"./signin.html":11,"hyperglue2":40}],10:[function(require,module,exports){
module.exports = "<div>\n  <h2>protected area</h2>\n  <p></p>\n  <form>\n    <button type=\"submit\">sign out</button>\n  </form>\n</div>";
},{}],11:[function(require,module,exports){
module.exports = "<div>\n  <h2>sign in</h2>\n  <p>please sign in to see the protected area</p>\n  <form>\n    <input placeholder=\"name\">\n    <button type=\"submit\">sign in</button>\n  </form>\n</div>";
},{}],12:[function(require,module,exports){
module.exports = "<div>\n  <h1>search</h1>\n  <p>use location.search to filter a list of robots (courtesy wikipedia)</p>\n  <input type=\"search\">\n  <ul><li></li></ul>\n</div>";
},{}],13:[function(require,module,exports){
var router = require('../../../');
var render = require('hyperglue2');
var robots = require('./model');

module.exports = Search;

function Search() {
  this.el = render(require('./index.html'));
  this.input = this.el.querySelector('input');
  this.input.addEventListener('keyup', function(evt) {
    router.search({ filter: evt.target.value });
  });
};

Search.prototype.show = function(router) {
  var data = robots;
  var query = router.location.query;
  var filter = new RegExp(query.filter, 'i');

  if (filter) {
    data = robots.filter(function(r) {
      return r.match(filter);
    });
  }
  
  data = { 'li': data };
  if (this.input.value !== query.filter) {
    data.input = { _attr: { value: query.filter }};
  }

  render(this.el, data);
};

},{"../../../":32,"./index.html":12,"./model":14,"hyperglue2":40}],14:[function(require,module,exports){
module.exports=[
"Coppélia",
"Tik-Tok",
"Helen O'Loy",
"Adam Link",
"Gnut",
"R. Daneel Olivaw",
"R. Giskard Reventlov",
"Norby",
"Humanoids",
"Astro Boy",
"The Electric Grandmother",
"Personoids",
"The Stepford Wives",
"Marvin the Paranoid Android",
"Roderick",
"R. Giskard Reventlov",
"Discworld golems",
"Moravecs",
"Boilerplate",
"Marvin the Paranoid Android",
"Mr. Roboto",
"Cyborg Noodle",
"The Mechanical Man",
"Maschinenmensch",
"The Mechanical Monsters",
"Gort",
"Ro-Man",
"Venusian",
"Kronos",
"Moguera",
"Talos",
"Torg",
"Mechani-Kong",
"Jet Jaguar",
"Mechagodzilla",
"The Stepford Wives",
"C-3PO",
"R2-D2",
"IG-88",
"4LOM",
"Ash",
"Ilia probe",
"C.H.O.M.P.S.",
"Galaxina",
"Rick Deckard",
"T-800",
"D.A.R.Y.L.",
"Bishop",
"Max",
"Johnny 5",
"ED-209",
"Cherry 2000",
"T-1000",
"Bishop",
"Project 2501",
"Evolver",
"Solo",
"Vanessa Kensington",
"Britney Spears",
"The Iron Giant",
"Sentinels",
"Battle Droids",
"Bender Bending Rodríguez",
"S1M0NE",
"B-4",
"R4-P17",
"T-850 Terminator",
"T-X",
"Sentinels",
"Omnidroid",
"Mata Nui",
"Vahki",
"Marvin the Paranoid Android",
"Autobots",
"Decepticons",
"Transmorphers",
"RoboDoc",
"'80s Robot",
"cite",
"references or sources",
"Rosie the Maid",
"Mechonoids",
"Chumblies",
"Robot B-9",
"Slim John",
"K-9",
"Kikaider",
"Haro",
"Cylons",
"Lucifer",
"H.E.R.B.I.E.",
"Dr. Theopolis",
"KITT",
"KARR",
"B.A.T.s",
"The Transformers",
"Go-bots",
"Voltron",
"synthoids",
"Conky 2000",
"T-Bob",
"Janice Em",
"Data",
"Lal",
"Juliana Tainer",
"Tom Servo",
"Crow T. Robot",
"Gypsy",
"Cambot",
"Joel Hodgson",
"Mike Nelson",
"Kryten",
"The Skutters",
"ASTAR",
"Arale Norimaki",
"Alpha 5",
"Machine Empire",
"Alpha 6",
"Evangelions",
"790",
"Blue Senturion",
"Buffybot",
"Bender",
"Melfina",
"Psycho Rangers",
"Andromon",
"Guardromon",
"Coconuts",
"Scratch and Grounder",
"Steel/Iron Clan",
"Coldfire/Coldstone",
"SWATbots",
"Bill Cosby",
"Miley Cyrus",
"Cybernetic Ghost of Christmas Past from the Future",
"Rabbot",
"Rommie",
"Frax",
"Cyclobots",
"GIR",
"Zeta",
"Alpha 7",
"Chii",
"Daigunder",
"Jenny XJ-9 Wakeman",
"her sisters",
"Melody",
"Kenny",
"Vega",
"various robotic villains",
"R. Dorothy Wayneright",
"Karaibots",
"H.E.L.P.eR.",
"Tachikoma",
"C.A.R.R",
"D.A.V.E.",
"Cylons",
"Cylon Centurions (Model 0005)",
"Cylon Centurions",
"The Hybrids",
"The First Hybrid",
"Number One (John Cavil)",
"Number Two (Leoben Conoy)",
"Number Three (D'anna Biers)",
"Number Four (Simon)",
"Number Five (Aaron Doral)",
"Number Six",
"Number Seven (Daniel)",
"Number Eight (Sharon Valerii)",
"The Final Five",
"Galen Tyrol",
"Tory Foster",
"Samuel T. Anders",
"Saul Tigh",
"Ellen Tigh",
"Miyu Greer",
"Gunslinger",
"R.I.C. 2.0",
"S.O.P.H.I.E.",
"Robotboy",
"Matthew McConaughey",
"Johnny Depp",
"Lucia von Bardas",
"GR: Giant Robo",
"Mackenzie Hartford",
"Tieria Erde",
"Ribbons Almark",
"Regene Regetta",
"Innovators",
"Cameron",
"Cyber Shredder",
"cite",
"references or sources",
"Awesome Android",
"Computo",
"G.I. Robot",
"Human Torch",
"The Little Helper",
"The Living Brain",
"Machine Man",
"Aaron Stack",
"Machine Teen",
"Manhunters",
"Metal Men",
"Red Tornado",
"Amazo",
"Tomorrow Woman",
"Hourman",
"Robotman (Robert Crane)",
"Robotman (Cliff Steele)",
"Doctor Ivo Robotnik",
"1A",
"H8",
"Roboduck",
"Sentinels",
"Skeets",
"Spider-Slayers",
"Brainiac",
"Ultron",
"Vision",
"Jocasta",
"Alkhema",
"ABC Warriors",
"Hammerstein",
"Armoured Gideon",
"Brassneck",
"Elektrobots",
"Mechanismo",
"Robot Archie",
"Walter the Wobot",
"Tonto",
"Lothar",
"Giant Robo",
"Doraemon",
"Android 17",
"Android 18",
"Banpei",
"Sigel",
"Project 2501",
"Alpha Hatsuseno",
"Chi",
"Chachamaru Karakuri",
"Tres Iques",
"Robotman",
"Eve",
"Ottobot",
"Ping",
"Lopez",
"Church",
"Tex",
"cite",
"references or sources",
"B.O.B.",
"Mega Man",
"Robot Masters",
"Metal Gears",
"Custom Robo",
"Omega Weapon",
"Badniks",
"E-Series",
"Metallix",
"Dr. Robotnik",
"Emerl",
"Gemerl",
"Metal Sonic",
"EggRobo",
"Reploids",
"Shamus",
"Cyber Sub-Zero",
"Cyrax",
"Sektor",
"Smoke",
"Robo",
"Cyberdisc",
"Sectopod",
"Jack",
"Combot",
"Alisa Bosconovitch",
"Cait Sith",
"ROB 64",
"Servbots",
"Robo-Kys",
"Cortana",
"343 Guilty Spark",
"2401 Penitent Tangent",
"Clank",
"KOS-MOS",
"MOMO",
"The Ninja Warriors",
"HK-47",
"Dog",
"Chibi-Robo",
"Mike",
"Medabots",
"Protoss",
"Virtual Woman",
"Forerunner",
"W-Numbers",
"GLaDOS",
"Wheatley",
"Frobot",
"Aigis",
"Metis",
"Labrys",
"EDI",
"Harbinger",
"HAL 9000"
]
},{}],15:[function(require,module,exports){
module.exports = "<div class=\"folder\">\n  <h3><a></a></h3>\n  <span class=\"error\"></span>\n  <ul>\n    <li><a></a></li>\n  </ul>\n  <div class=\"editor\"></div>\n</div>";
},{}],16:[function(require,module,exports){
module.exports = "<div>\n  <style>\n    .folder {\n      display: inline-block;\n      vertical-align: top;\n      border: 1px solid #CCC;\n      background-color: #EEE;\n      margin-right: 20px;\n      padding: 20px;\n    }\n    .folder h3 {\n      margin-top: 0;\n    }\n    .folder ul {\n      padding-left: 20px;\n    }\n  </style>\n  <h1>stacking</h1>\n  <p>set <code>r.stack</code> to a <code>string</code> value to delimit the route before matching views</p>\n  <div class=\"folders\"></div>\n</div>";
},{}],17:[function(require,module,exports){
var router = require('../../../');
var render = require('hyperglue2');
var model = require('./model');

module.exports = Stacks;

function Stacks() {
  this.el = render(require('./index.html'));
};

Stacks.prototype.show = function(r) {
  if (this.router) return;

  this.router = router({
    root: r.route,
    watch: 'pathname',
    outlet: this.el.querySelector('.folders'),
    stack: '/',
    routes: {
      '.*': Folder
    }
  });
};

Stacks.prototype.destroy = function() {
  this.router.destroy();
};

//////

function Folder() {
  this.el = render(require('./folder.html'));
}

Folder.prototype.show = function(r) {
  var route = r.route;
  var title = route || '/';
  var parts = title.split('/').slice(1);
  var folders = model;
  var error = null;
  var editor = null;

  for (var i in parts) {
    var part = parts[i];
    folders = part ? folders[part] : folders;
    if (!folders) {
      error = 'Not Found';
      break;
    }
  }

  if (typeof folders === 'object') {
    folders = Object.keys(folders).map(function(item) {
      return {
        'a': {
          _text: item,
          _attr: { href: r.root + (title === '/' ? title : title + '/') + item },
        }
      };
    });
  }
  else if (folders) {
    editor = folders;
    folders = null;
  }

  render(this.el, {
    'h3 a': {
      _text: title, 
      _attr: { href: r.root + (title === '/' ? '' : title) },
    },
    '.error': error,
    '.editor': editor,
    'li': folders || [],
  });
};

},{"../../../":32,"./folder.html":15,"./index.html":16,"./model":18,"hyperglue2":40}],18:[function(require,module,exports){
module.exports={
  "one": {
    "two": {
      "three": {
        "file.txt": "text content of file"
      }
    }
  },
  "two": {
    "three": {
      "otherfile.txt": "oh hai"
    }
  },
  "three": {
    "file.txt": "sup"
  }
}

},{}],19:[function(require,module,exports){
module.exports = "<div>\n  <style>\n    .box {\n      width: 100px;\n      height: 100px;\n      border:1px solid #CCC;\n      display: inline-block;\n      margin-left: 1em;\n      vertical-align: middle;\n      position: relative;\n    }\n    .transition-bg {\n      position: absolute;\n      width: 100%;\n      height: 100%;\n      opacity: 0;\n      transition: opacity 0.5s;\n    }\n    .center {\n      position: relative;\n      text-align: center;\n      padding: 0;\n      margin: 0;\n      width: 100%;\n      top: 50%;\n      transform: translateY(-50%);\n    }\n  </style>\n  <h1>transitions</h1>\n  <p>transitions</p>\n  <ul style=\"display:inline-block; vertical-align:middle;\">\n    <li><a href=\"/transitions/red\">red</a></li>\n    <li><a href=\"/transitions/green\">green</a></li>\n    <li><a href=\"/transitions/blue\">blue</a></li>\n  </ul>\n  <div class=\"outlet box\"></div>\n</div>\n";
},{}],20:[function(require,module,exports){
var router = require('../../../');
var render = require('hyperglue2');
var inherits = require('inherits');
var template = require('./index.html');
var templateview = require('./transition.html');
var model = require('./model');

module.exports = TransitionsView;

function TransitionsView() {
  this.el = render(template);
  this.router = router({
    watch: 'pathname',
    outlet: this.el.querySelector('.outlet'),
    routes: {
      '/transitions/.*': Transition,
    }
  });

  this.deselect = deselect.bind(this);
  document.addEventListener('click', this.deselect);
};

TransitionsView.prototype.hide = function() {
  this.router.destroy();
  document.removeEventListener('click', this.deselect);
};

function deselect(evt) {
  if (evt.target.nodeName !== 'A') {
    router.push('/transitions');
  }
}

function Transition() {
  var id = window.location.pathname.replace(/.*\//, '');
  var m = model[id];
  this.el = render(templateview, {
    _attr: { style: 'background:' + m.color + ';' },
    h3: m.title,
  });
}

Transition.prototype.show = function() {
  var self = this;
  window.getComputedStyle(self.el).opacity; // need to do this or the transition doesn't get applied
  self.el.style.opacity = '1';
};

Transition.prototype.hide = function(cb) {  // if hide() accepts a callback the router will wait before removing the element
  var self = this;
  this.el.style.opacity = '0';
  this.el.addEventListener('transitionend', cb);
};

},{"../../../":32,"./index.html":19,"./model":21,"./transition.html":22,"hyperglue2":40,"inherits":42}],21:[function(require,module,exports){
module.exports={
  "red": {
    "title": "red",
    "color": "#FAA"
  },
  "green": {
    "title": "green",
    "color": "#AFA"
  },
  "blue": { 
    "title": "blue",
    "color": "#AAF"
  }
}
},{}],22:[function(require,module,exports){
module.exports = "<div class=\"transition-bg\">\n  <h3 class=\"center\"></h3>\n</div>";
},{}],23:[function(require,module,exports){
module.exports = "<h1>web component</h1>\n<p>your browser supports web components!</p>";
},{}],24:[function(require,module,exports){
var inherits = require('inherits');

module.exports = 'WEB-COMPONENT'; // export tag name for instantiating via document.createElement(tagName)

function WebComponent() {}
inherits(WebComponent, HTMLElement);

WebComponent.prototype.createdCallback = function() {
  console.log('web-component lifecycle: createdCallback');
  var shadow = this.createShadowRoot();
  shadow.innerHTML = require('./index.html');
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

},{"./index.html":23,"inherits":42}],25:[function(require,module,exports){
module.exports = "<div>\n  <style>\n    .z-control-level {\n      display: inline-block;\n      border: 1px solid #CCC;\n      margin-right: 1em;\n      padding: 1em;\n    }\n    .z-control-level a:last-of-type::before {\n      content: \"|\";\n      text-decoration: none;\n      display: inline-block;\n      padding-left: 5px;\n      padding-right: 5px;\n    }\n    .z-control-level a:only-of-type::before {\n      content: \"\";\n      padding: 0;\n    }\n  </style>\n  <h1>stacks</h1>\n  <p>you can control view ordering by setting a <code>zIndex</code> property on your views' constructors</p>\n  <div class=\"levels\"></div>\n</div>";
},{}],26:[function(require,module,exports){
var router = require('../../../');
var render = require('hyperglue2');
var inherits = require('inherits');

module.exports = ZControl;

function ZControl() {
  this.el = render(require('./index.html'));
};

ZControl.prototype.show = function(r) {
  if (this.router) return;

  this.router = router({
    root: r.route,
    watch: 'pathname',
    outlet: this.el.querySelector('.levels'),
    stack: true,
    routes: {
      '': require('./level-one'),
      '/two': require('./level-two'),
      '/two/three': require('./level-three'),
    }
  });
};

ZControl.prototype.destroy = function() {
  this.router.destroy();
};

},{"../../../":32,"./index.html":25,"./level-one":27,"./level-three":28,"./level-two":29,"hyperglue2":40,"inherits":42}],27:[function(require,module,exports){
var Level = require('./level');
var render = require('hyperglue2');
var inherits = require('inherits');

module.exports = One;

function One() {
  this.el = render(require('./level.html'), {
    h3: 'level 1',
    a: [{
      _attr: { href: window.location.pathname + '/two' },
      _text: 'forward',
    }]
  });
}
inherits(One, Level);

},{"./level":31,"./level.html":30,"hyperglue2":40,"inherits":42}],28:[function(require,module,exports){
var Level = require('./level');
var render = require('hyperglue2');
var inherits = require('inherits');

module.exports = Three;

function Three() {
  this.el = render(require('./level.html'), {
    h3: 'level 3',
    a: [{
      _attr: { href: window.location.pathname.replace(/\/[^\/]*$/, '') },
      _text: 'back',
    }]
  });
}
Three.zIndex = 3;
inherits(Three, Level);
},{"./level":31,"./level.html":30,"hyperglue2":40,"inherits":42}],29:[function(require,module,exports){
var Level = require('./level');
var render = require('hyperglue2');
var inherits = require('inherits');

module.exports = Two;

function Two() {
  this.el = render(require('./level.html'), {
    h3: 'level 2',
    a: [{
      _attr: { href: window.location.pathname.replace(/\/[^\/]*$/, '') },
      _text: 'back',
    }, {
      _attr: { href: window.location.pathname + '/three' },
      _text: 'forward',
    }]
  });
}
Two.zIndex = 2;  // indicate preferred stacking order to support deep linking to somewhere in the middle of the stack
inherits(Two, Level);
},{"./level":31,"./level.html":30,"hyperglue2":40,"inherits":42}],30:[function(require,module,exports){
module.exports = "<div class=\"z-control-level\">\n  <h3></h3>\n  <nav>\n    <a></a>\n  </nav>\n</div>";
},{}],31:[function(require,module,exports){
module.exports = Level;

function Level() {}

Level.prototype.show = function() {
  this.el.style.pointerEvents = '';
  this.el.style.opacity = '';
};

Level.prototype.hide = function() {
  this.el.style.pointerEvents = 'none';
  this.el.style.opacity = '0.35';
};

},{}],32:[function(require,module,exports){
var qs = require('querystring');
var url = require('url');
var xtend = require('xtend/mutable');
var clickjack = require('./lib/clickjack');
var firstmatch = require('./lib/firstmatch');

var lasthref = null;
var historyPosition = window.history.length; // for telling the difference between back / forward buttons
var routers = [];
var queue = [];
var lock = false;

// hijack link clicks and form submissions
clickjack(window, 'a', 'click', onclick);
clickjack(window, 'form', 'submit', onclick);

// handle back / forward buttons
window.addEventListener('popstate', onpopstate);

// replace initial state
window.history.replaceState(historyPosition, null, window.location.href);

module.exports = Router;

Router.push = function(location, replace, stack) {
  push(location, replace, stack);
};

Router.pop = function() {
  window.history.back();
};

Router.search = function(params, replace) {
  var search = qs.parse(window.location.search.slice(1));
  xtend(search, params);
  for (var i in search) {
    if (!search[i]) {
      delete search[i];
    }
  }
  search = qs.stringify(search);
  search = search ? '?' + search : '';
  push(window.location.pathname + search + window.location.hash, replace);
};

function Router(props) {
  if (!(this instanceof Router))
    return new Router(props);

  this.root = '';
  this.views = [];
  xtend(this, props);

  routers.push(this);
  update.call(this, mklocation());
}

Object.defineProperty(Router.prototype, 'outlet', {
  get: function() {
    return this._outlet;
  },
  set: function(outlet) {
    this._outlet = typeof outlet === 'string' ? document.querySelector(outlet) : outlet;
  }
});

Router.prototype.push = function(locationComponent, replace, stack) {
  var locationString = mklocationString(this.watch, locationComponent, this.root);
  push(locationString, replace, false, stack);
};

Router.prototype.pop = function(replace) {
  var locationComponent = '';
  var root = this.root;
  if (this.views.length > 1) {
    var next = this.views.slice(-2)[0];
    locationComponent = next.location[this.watch];
    root = '';
  }
  var locationString = mklocationString(this.watch, locationComponent, root);
  push(locationString, replace, true);
};

Router.prototype.destroy = function() {
  var self = this;
  this.destroyed = true;
  while (this.views.length) {
    var v = this.views.pop();
    v.view.hide && v.view.hide();
  }
  routers = routers.filter(function(r) { return r !== self });
};

function push(location, replace, back, stack) {
  location = mklocation(location);
  if (location.href === lasthref) return;

  if (replace) {
    window.history.replaceState(historyPosition, null, location.href);
  }
  else {
    window.history.pushState(++historyPosition, null, location.href);
  }

  updateAll(location, back, stack);
  lasthref = location.href;
}

function updateAll(location, back, stack) {
  var r = routers.slice();
  for (var i in r) {
    var router = r[i];
    if (router && !router.destroyed) {
      update.call(router, location, back, stack);
    }
  }
}

function update(location, back, stack) {
  if (lock) return queue.push(update.bind(this, location, back, stack));
  else lock = true;

  // window.location should match by now, but we make this property
  // accessible for conveniently accessing a parsed querystring object
  this.location = location;

  // get route but respect root if there is one
  var route = location[this.watch];
  if (this.root) {
    route = route.replace(new RegExp('^' + this.root), '');
  }

  // try to match the route
  var match = firstmatch(route, this.routes);

  // this is the "true" route - it should be the same as the actual route, but with any regex capture groups removed
  // nested routers can access this on their parent to determine a suitable `root` value
  this.route = match.match;

  // look for a matching next route in the existing views
  var next = null;
  for (var i=0; i<this.views.length; i++) {
    var view = this.views[i];
    if (view.route === this.route) {
      this.back = back = true;
      next = view;
      break;
    }
  }

  // if we found the next view in the stack hide 
  // everything after it, show it, and be done
  if (next) {
    for (var n=this.views.length-1; n>i; n--) {
      hideview.call(this, this.views[n], true);
    }
    next.view.show && next.view.show(this);
    return unlock();
  }

  // if this.stack is a string, use it to split the route up into chunks
  if (this.stack && this.stack !== true) {
    var base = route.slice(0, 1);
    var debasedroute = route.slice(1);
    var parts = (debasedroute ? this.stack + debasedroute : '').split(this.stack);
    var stackedroutes = parts.slice(0, -1);

    // first remove and excess views from the stack
    while (this.views.length > stackedroutes.length) {
      hideview.call(this, this.views.slice(-1)[0], true);
    }

    // if there are missing views from the stack, fill them in before updating the current route
    if (parts.length > 1 && this.views.length < (parts.length - 1)) {
      for (var i=0; i<stackedroutes.length; i++) {
        var depth = stackedroutes.length - i;
        var pre = this.views.slice(-depth)[0];
        if (!pre) {
          var preroute = stackedroutes.slice(0, i+1).join(this.stack);
          var prelocation = {};
          prelocation[this.watch] = preroute;
          update.call(this, mklocation(prelocation), back, stack);
        }
      }
      update.call(this, location, back, stack);
      return unlock();
    }
  }

  // hide the last view if there is one
  var last = this.views.slice(-1)[0];
  if (last) {

    // respect zIndex
    if (this.stack && match.value) {
      back = this.back = (last.zIndex || 0) > (match.value.zIndex || 0);
    }

    hideview.call(this, last, back, this.stack || stack);
  }

  // match route with a view constructor
  next = match.value || this.notFound;
  if (next) {

    // create and store the view meta object
    next = {
      view: typeof next === 'string' ? document.createElement(next) : new next(),
      location: location,
      zIndex: next.zIndex,
      route: this.route,
    };
    this.views.push(next);

    // put things on the dom
    if (this._outlet) {
      var el = next.view instanceof HTMLElement ? next.view : next.view.el;
      if (el && !el.parentNode) {
        if (back) {
          this._outlet.insertBefore(el, this._outlet.firstChild);
        }
        else {
          this._outlet.appendChild(el);
        }
      }
    }

    // show
    next.view.show && next.view.show(this);
  }
  
  unlock();
}

function hideview(meta, back, stacked) {
  var el = meta.view instanceof HTMLElement ? meta.view : meta.view.el;
  if (back || !stacked) {
    if (meta.view.hide) {
      if (meta.view.hide.length) {
        meta.view.hide(removeElement.bind(null, el));
      }
      else {
        meta.view.hide();
        removeElement(el);
      }
    }
    else {
      removeElement(el);
    }

    this.views.pop();
    meta.view.destroy && meta.view.destroy();
  }
  else {
    if (meta.view.hide) {
      if (meta.view.hide.length) {
        meta.view.hide(function() {});
      }
      else {
        meta.view.hide();
      }
    }
  }
}

function onpopstate(evt) {
  var back = true;
  var location = mklocation();

  if (historyPosition < evt.state) {
    back = false;
  }

  if (!isNaN(evt.state)) {
    historyPosition = evt.state;
  }

  updateAll(location, back);
  lasthref = location.href;
}

function onclick(evt, target) {
  var location = target;
  if (evt.target.nodeName === 'FORM') {
    if (!evt.target.action) {
      evt.preventDefault();
      return;
    }
    location = evt.target.action;
  }
  location = mklocation(location);
  if (location.host !== window.location.host) return;
  evt.preventDefault();
  push(location);
}

function mklocation(location) {
  if (!location) location = window.location;
  if (typeof location === 'object') location = (location.protocol || window.location.protocol) + '//' + 
                                               (location.host || window.location.host) + 
                                               (location.pathname || '') + 
                                               (location.search || '') + 
                                               (location.hash || '');
  location = url.parse(location, true);
  location.hash = location.hash || '';      // annoying, shouldn't these come back empty strings instead of null?
  location.search = location.search || '';
  location.query = location.query || {};
  return location;
}

function mklocationString(componentName, componentValue, root) {
  var components = [ 'pathname', 'search', 'hash' ];
  var locationString = '';
  for (var i in components) {
    var component = components[i];
    locationString += component === componentName ? root + componentValue : window.location[component];
  }
  return locationString;
}

function removeElement(el) {
  if (el && el.parentNode) {
    el.parentNode.removeChild(el);
  }
}

function unlock() {
  lock = false;
  if (queue.length) queue.shift()();
}

},{"./lib/clickjack":33,"./lib/firstmatch":34,"querystring":38,"url":39,"xtend/mutable":43}],33:[function(require,module,exports){
var matches = Element.prototype.matches ||
              Element.prototype.matchesSelector ||
              Element.prototype.mozMatchesSelector ||
              Element.prototype.webkitMatchesSelector ||
              Element.prototype.msMatchesSelector;

module.exports = function(ctx, selector, event, cb) {
  if (!matches) return;

  var ctx = ctx || window;
  ctx.addEventListener(event, function(evt) {
    if (evt.metaKey || evt.defaultPrevented) return;
    
    var target = evt.target;
    while (target !== document && !matches.call(target, selector)) {
      target = target.parentNode;
    }
    
    if (target !== document) {
      cb(evt, target);
    }
  });
};

},{}],34:[function(require,module,exports){
module.exports = function(route, routes) {
  var first = {};

  if (typeof route !== 'string') {
    return first;
  }

  for (var key in routes) {
    var regex = new RegExp('^' + key + '$');
    var match = route.match(regex);
    if (match) {
      first.match = match;
      first.value = routes[key];
      break;
    }
  }

  if (first.match) {
    match = first.match.reverse();
    first.match = match.pop();
    for (var i=0; i<match.length; i++) {
      first.match = first.match.replace(new RegExp(match[i] + '$'), '');
    }
  }

  return first;
};

},{}],35:[function(require,module,exports){
(function (global){
/*! http://mths.be/punycode v1.2.4 by @mathias */
;(function(root) {

	/** Detect free variables */
	var freeExports = typeof exports == 'object' && exports;
	var freeModule = typeof module == 'object' && module &&
		module.exports == freeExports && module;
	var freeGlobal = typeof global == 'object' && global;
	if (freeGlobal.global === freeGlobal || freeGlobal.window === freeGlobal) {
		root = freeGlobal;
	}

	/**
	 * The `punycode` object.
	 * @name punycode
	 * @type Object
	 */
	var punycode,

	/** Highest positive signed 32-bit float value */
	maxInt = 2147483647, // aka. 0x7FFFFFFF or 2^31-1

	/** Bootstring parameters */
	base = 36,
	tMin = 1,
	tMax = 26,
	skew = 38,
	damp = 700,
	initialBias = 72,
	initialN = 128, // 0x80
	delimiter = '-', // '\x2D'

	/** Regular expressions */
	regexPunycode = /^xn--/,
	regexNonASCII = /[^ -~]/, // unprintable ASCII chars + non-ASCII chars
	regexSeparators = /\x2E|\u3002|\uFF0E|\uFF61/g, // RFC 3490 separators

	/** Error messages */
	errors = {
		'overflow': 'Overflow: input needs wider integers to process',
		'not-basic': 'Illegal input >= 0x80 (not a basic code point)',
		'invalid-input': 'Invalid input'
	},

	/** Convenience shortcuts */
	baseMinusTMin = base - tMin,
	floor = Math.floor,
	stringFromCharCode = String.fromCharCode,

	/** Temporary variable */
	key;

	/*--------------------------------------------------------------------------*/

	/**
	 * A generic error utility function.
	 * @private
	 * @param {String} type The error type.
	 * @returns {Error} Throws a `RangeError` with the applicable error message.
	 */
	function error(type) {
		throw RangeError(errors[type]);
	}

	/**
	 * A generic `Array#map` utility function.
	 * @private
	 * @param {Array} array The array to iterate over.
	 * @param {Function} callback The function that gets called for every array
	 * item.
	 * @returns {Array} A new array of values returned by the callback function.
	 */
	function map(array, fn) {
		var length = array.length;
		while (length--) {
			array[length] = fn(array[length]);
		}
		return array;
	}

	/**
	 * A simple `Array#map`-like wrapper to work with domain name strings.
	 * @private
	 * @param {String} domain The domain name.
	 * @param {Function} callback The function that gets called for every
	 * character.
	 * @returns {Array} A new string of characters returned by the callback
	 * function.
	 */
	function mapDomain(string, fn) {
		return map(string.split(regexSeparators), fn).join('.');
	}

	/**
	 * Creates an array containing the numeric code points of each Unicode
	 * character in the string. While JavaScript uses UCS-2 internally,
	 * this function will convert a pair of surrogate halves (each of which
	 * UCS-2 exposes as separate characters) into a single code point,
	 * matching UTF-16.
	 * @see `punycode.ucs2.encode`
	 * @see <http://mathiasbynens.be/notes/javascript-encoding>
	 * @memberOf punycode.ucs2
	 * @name decode
	 * @param {String} string The Unicode input string (UCS-2).
	 * @returns {Array} The new array of code points.
	 */
	function ucs2decode(string) {
		var output = [],
		    counter = 0,
		    length = string.length,
		    value,
		    extra;
		while (counter < length) {
			value = string.charCodeAt(counter++);
			if (value >= 0xD800 && value <= 0xDBFF && counter < length) {
				// high surrogate, and there is a next character
				extra = string.charCodeAt(counter++);
				if ((extra & 0xFC00) == 0xDC00) { // low surrogate
					output.push(((value & 0x3FF) << 10) + (extra & 0x3FF) + 0x10000);
				} else {
					// unmatched surrogate; only append this code unit, in case the next
					// code unit is the high surrogate of a surrogate pair
					output.push(value);
					counter--;
				}
			} else {
				output.push(value);
			}
		}
		return output;
	}

	/**
	 * Creates a string based on an array of numeric code points.
	 * @see `punycode.ucs2.decode`
	 * @memberOf punycode.ucs2
	 * @name encode
	 * @param {Array} codePoints The array of numeric code points.
	 * @returns {String} The new Unicode string (UCS-2).
	 */
	function ucs2encode(array) {
		return map(array, function(value) {
			var output = '';
			if (value > 0xFFFF) {
				value -= 0x10000;
				output += stringFromCharCode(value >>> 10 & 0x3FF | 0xD800);
				value = 0xDC00 | value & 0x3FF;
			}
			output += stringFromCharCode(value);
			return output;
		}).join('');
	}

	/**
	 * Converts a basic code point into a digit/integer.
	 * @see `digitToBasic()`
	 * @private
	 * @param {Number} codePoint The basic numeric code point value.
	 * @returns {Number} The numeric value of a basic code point (for use in
	 * representing integers) in the range `0` to `base - 1`, or `base` if
	 * the code point does not represent a value.
	 */
	function basicToDigit(codePoint) {
		if (codePoint - 48 < 10) {
			return codePoint - 22;
		}
		if (codePoint - 65 < 26) {
			return codePoint - 65;
		}
		if (codePoint - 97 < 26) {
			return codePoint - 97;
		}
		return base;
	}

	/**
	 * Converts a digit/integer into a basic code point.
	 * @see `basicToDigit()`
	 * @private
	 * @param {Number} digit The numeric value of a basic code point.
	 * @returns {Number} The basic code point whose value (when used for
	 * representing integers) is `digit`, which needs to be in the range
	 * `0` to `base - 1`. If `flag` is non-zero, the uppercase form is
	 * used; else, the lowercase form is used. The behavior is undefined
	 * if `flag` is non-zero and `digit` has no uppercase form.
	 */
	function digitToBasic(digit, flag) {
		//  0..25 map to ASCII a..z or A..Z
		// 26..35 map to ASCII 0..9
		return digit + 22 + 75 * (digit < 26) - ((flag != 0) << 5);
	}

	/**
	 * Bias adaptation function as per section 3.4 of RFC 3492.
	 * http://tools.ietf.org/html/rfc3492#section-3.4
	 * @private
	 */
	function adapt(delta, numPoints, firstTime) {
		var k = 0;
		delta = firstTime ? floor(delta / damp) : delta >> 1;
		delta += floor(delta / numPoints);
		for (/* no initialization */; delta > baseMinusTMin * tMax >> 1; k += base) {
			delta = floor(delta / baseMinusTMin);
		}
		return floor(k + (baseMinusTMin + 1) * delta / (delta + skew));
	}

	/**
	 * Converts a Punycode string of ASCII-only symbols to a string of Unicode
	 * symbols.
	 * @memberOf punycode
	 * @param {String} input The Punycode string of ASCII-only symbols.
	 * @returns {String} The resulting string of Unicode symbols.
	 */
	function decode(input) {
		// Don't use UCS-2
		var output = [],
		    inputLength = input.length,
		    out,
		    i = 0,
		    n = initialN,
		    bias = initialBias,
		    basic,
		    j,
		    index,
		    oldi,
		    w,
		    k,
		    digit,
		    t,
		    /** Cached calculation results */
		    baseMinusT;

		// Handle the basic code points: let `basic` be the number of input code
		// points before the last delimiter, or `0` if there is none, then copy
		// the first basic code points to the output.

		basic = input.lastIndexOf(delimiter);
		if (basic < 0) {
			basic = 0;
		}

		for (j = 0; j < basic; ++j) {
			// if it's not a basic code point
			if (input.charCodeAt(j) >= 0x80) {
				error('not-basic');
			}
			output.push(input.charCodeAt(j));
		}

		// Main decoding loop: start just after the last delimiter if any basic code
		// points were copied; start at the beginning otherwise.

		for (index = basic > 0 ? basic + 1 : 0; index < inputLength; /* no final expression */) {

			// `index` is the index of the next character to be consumed.
			// Decode a generalized variable-length integer into `delta`,
			// which gets added to `i`. The overflow checking is easier
			// if we increase `i` as we go, then subtract off its starting
			// value at the end to obtain `delta`.
			for (oldi = i, w = 1, k = base; /* no condition */; k += base) {

				if (index >= inputLength) {
					error('invalid-input');
				}

				digit = basicToDigit(input.charCodeAt(index++));

				if (digit >= base || digit > floor((maxInt - i) / w)) {
					error('overflow');
				}

				i += digit * w;
				t = k <= bias ? tMin : (k >= bias + tMax ? tMax : k - bias);

				if (digit < t) {
					break;
				}

				baseMinusT = base - t;
				if (w > floor(maxInt / baseMinusT)) {
					error('overflow');
				}

				w *= baseMinusT;

			}

			out = output.length + 1;
			bias = adapt(i - oldi, out, oldi == 0);

			// `i` was supposed to wrap around from `out` to `0`,
			// incrementing `n` each time, so we'll fix that now:
			if (floor(i / out) > maxInt - n) {
				error('overflow');
			}

			n += floor(i / out);
			i %= out;

			// Insert `n` at position `i` of the output
			output.splice(i++, 0, n);

		}

		return ucs2encode(output);
	}

	/**
	 * Converts a string of Unicode symbols to a Punycode string of ASCII-only
	 * symbols.
	 * @memberOf punycode
	 * @param {String} input The string of Unicode symbols.
	 * @returns {String} The resulting Punycode string of ASCII-only symbols.
	 */
	function encode(input) {
		var n,
		    delta,
		    handledCPCount,
		    basicLength,
		    bias,
		    j,
		    m,
		    q,
		    k,
		    t,
		    currentValue,
		    output = [],
		    /** `inputLength` will hold the number of code points in `input`. */
		    inputLength,
		    /** Cached calculation results */
		    handledCPCountPlusOne,
		    baseMinusT,
		    qMinusT;

		// Convert the input in UCS-2 to Unicode
		input = ucs2decode(input);

		// Cache the length
		inputLength = input.length;

		// Initialize the state
		n = initialN;
		delta = 0;
		bias = initialBias;

		// Handle the basic code points
		for (j = 0; j < inputLength; ++j) {
			currentValue = input[j];
			if (currentValue < 0x80) {
				output.push(stringFromCharCode(currentValue));
			}
		}

		handledCPCount = basicLength = output.length;

		// `handledCPCount` is the number of code points that have been handled;
		// `basicLength` is the number of basic code points.

		// Finish the basic string - if it is not empty - with a delimiter
		if (basicLength) {
			output.push(delimiter);
		}

		// Main encoding loop:
		while (handledCPCount < inputLength) {

			// All non-basic code points < n have been handled already. Find the next
			// larger one:
			for (m = maxInt, j = 0; j < inputLength; ++j) {
				currentValue = input[j];
				if (currentValue >= n && currentValue < m) {
					m = currentValue;
				}
			}

			// Increase `delta` enough to advance the decoder's <n,i> state to <m,0>,
			// but guard against overflow
			handledCPCountPlusOne = handledCPCount + 1;
			if (m - n > floor((maxInt - delta) / handledCPCountPlusOne)) {
				error('overflow');
			}

			delta += (m - n) * handledCPCountPlusOne;
			n = m;

			for (j = 0; j < inputLength; ++j) {
				currentValue = input[j];

				if (currentValue < n && ++delta > maxInt) {
					error('overflow');
				}

				if (currentValue == n) {
					// Represent delta as a generalized variable-length integer
					for (q = delta, k = base; /* no condition */; k += base) {
						t = k <= bias ? tMin : (k >= bias + tMax ? tMax : k - bias);
						if (q < t) {
							break;
						}
						qMinusT = q - t;
						baseMinusT = base - t;
						output.push(
							stringFromCharCode(digitToBasic(t + qMinusT % baseMinusT, 0))
						);
						q = floor(qMinusT / baseMinusT);
					}

					output.push(stringFromCharCode(digitToBasic(q, 0)));
					bias = adapt(delta, handledCPCountPlusOne, handledCPCount == basicLength);
					delta = 0;
					++handledCPCount;
				}
			}

			++delta;
			++n;

		}
		return output.join('');
	}

	/**
	 * Converts a Punycode string representing a domain name to Unicode. Only the
	 * Punycoded parts of the domain name will be converted, i.e. it doesn't
	 * matter if you call it on a string that has already been converted to
	 * Unicode.
	 * @memberOf punycode
	 * @param {String} domain The Punycode domain name to convert to Unicode.
	 * @returns {String} The Unicode representation of the given Punycode
	 * string.
	 */
	function toUnicode(domain) {
		return mapDomain(domain, function(string) {
			return regexPunycode.test(string)
				? decode(string.slice(4).toLowerCase())
				: string;
		});
	}

	/**
	 * Converts a Unicode string representing a domain name to Punycode. Only the
	 * non-ASCII parts of the domain name will be converted, i.e. it doesn't
	 * matter if you call it with a domain that's already in ASCII.
	 * @memberOf punycode
	 * @param {String} domain The domain name to convert, as a Unicode string.
	 * @returns {String} The Punycode representation of the given domain name.
	 */
	function toASCII(domain) {
		return mapDomain(domain, function(string) {
			return regexNonASCII.test(string)
				? 'xn--' + encode(string)
				: string;
		});
	}

	/*--------------------------------------------------------------------------*/

	/** Define the public API */
	punycode = {
		/**
		 * A string representing the current Punycode.js version number.
		 * @memberOf punycode
		 * @type String
		 */
		'version': '1.2.4',
		/**
		 * An object of methods to convert from JavaScript's internal character
		 * representation (UCS-2) to Unicode code points, and back.
		 * @see <http://mathiasbynens.be/notes/javascript-encoding>
		 * @memberOf punycode
		 * @type Object
		 */
		'ucs2': {
			'decode': ucs2decode,
			'encode': ucs2encode
		},
		'decode': decode,
		'encode': encode,
		'toASCII': toASCII,
		'toUnicode': toUnicode
	};

	/** Expose `punycode` */
	// Some AMD build optimizers, like r.js, check for specific condition patterns
	// like the following:
	if (
		typeof define == 'function' &&
		typeof define.amd == 'object' &&
		define.amd
	) {
		define('punycode', function() {
			return punycode;
		});
	} else if (freeExports && !freeExports.nodeType) {
		if (freeModule) { // in Node.js or RingoJS v0.8.0+
			freeModule.exports = punycode;
		} else { // in Narwhal or RingoJS v0.7.0-
			for (key in punycode) {
				punycode.hasOwnProperty(key) && (freeExports[key] = punycode[key]);
			}
		}
	} else { // in Rhino or a web browser
		root.punycode = punycode;
	}

}(this));

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],36:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';

// If obj.hasOwnProperty has been overridden, then calling
// obj.hasOwnProperty(prop) will break.
// See: https://github.com/joyent/node/issues/1707
function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

module.exports = function(qs, sep, eq, options) {
  sep = sep || '&';
  eq = eq || '=';
  var obj = {};

  if (typeof qs !== 'string' || qs.length === 0) {
    return obj;
  }

  var regexp = /\+/g;
  qs = qs.split(sep);

  var maxKeys = 1000;
  if (options && typeof options.maxKeys === 'number') {
    maxKeys = options.maxKeys;
  }

  var len = qs.length;
  // maxKeys <= 0 means that we should not limit keys count
  if (maxKeys > 0 && len > maxKeys) {
    len = maxKeys;
  }

  for (var i = 0; i < len; ++i) {
    var x = qs[i].replace(regexp, '%20'),
        idx = x.indexOf(eq),
        kstr, vstr, k, v;

    if (idx >= 0) {
      kstr = x.substr(0, idx);
      vstr = x.substr(idx + 1);
    } else {
      kstr = x;
      vstr = '';
    }

    k = decodeURIComponent(kstr);
    v = decodeURIComponent(vstr);

    if (!hasOwnProperty(obj, k)) {
      obj[k] = v;
    } else if (isArray(obj[k])) {
      obj[k].push(v);
    } else {
      obj[k] = [obj[k], v];
    }
  }

  return obj;
};

var isArray = Array.isArray || function (xs) {
  return Object.prototype.toString.call(xs) === '[object Array]';
};

},{}],37:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';

var stringifyPrimitive = function(v) {
  switch (typeof v) {
    case 'string':
      return v;

    case 'boolean':
      return v ? 'true' : 'false';

    case 'number':
      return isFinite(v) ? v : '';

    default:
      return '';
  }
};

module.exports = function(obj, sep, eq, name) {
  sep = sep || '&';
  eq = eq || '=';
  if (obj === null) {
    obj = undefined;
  }

  if (typeof obj === 'object') {
    return map(objectKeys(obj), function(k) {
      var ks = encodeURIComponent(stringifyPrimitive(k)) + eq;
      if (isArray(obj[k])) {
        return map(obj[k], function(v) {
          return ks + encodeURIComponent(stringifyPrimitive(v));
        }).join(sep);
      } else {
        return ks + encodeURIComponent(stringifyPrimitive(obj[k]));
      }
    }).join(sep);

  }

  if (!name) return '';
  return encodeURIComponent(stringifyPrimitive(name)) + eq +
         encodeURIComponent(stringifyPrimitive(obj));
};

var isArray = Array.isArray || function (xs) {
  return Object.prototype.toString.call(xs) === '[object Array]';
};

function map (xs, f) {
  if (xs.map) return xs.map(f);
  var res = [];
  for (var i = 0; i < xs.length; i++) {
    res.push(f(xs[i], i));
  }
  return res;
}

var objectKeys = Object.keys || function (obj) {
  var res = [];
  for (var key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) res.push(key);
  }
  return res;
};

},{}],38:[function(require,module,exports){
'use strict';

exports.decode = exports.parse = require('./decode');
exports.encode = exports.stringify = require('./encode');

},{"./decode":36,"./encode":37}],39:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var punycode = require('punycode');

exports.parse = urlParse;
exports.resolve = urlResolve;
exports.resolveObject = urlResolveObject;
exports.format = urlFormat;

exports.Url = Url;

function Url() {
  this.protocol = null;
  this.slashes = null;
  this.auth = null;
  this.host = null;
  this.port = null;
  this.hostname = null;
  this.hash = null;
  this.search = null;
  this.query = null;
  this.pathname = null;
  this.path = null;
  this.href = null;
}

// Reference: RFC 3986, RFC 1808, RFC 2396

// define these here so at least they only have to be
// compiled once on the first module load.
var protocolPattern = /^([a-z0-9.+-]+:)/i,
    portPattern = /:[0-9]*$/,

    // RFC 2396: characters reserved for delimiting URLs.
    // We actually just auto-escape these.
    delims = ['<', '>', '"', '`', ' ', '\r', '\n', '\t'],

    // RFC 2396: characters not allowed for various reasons.
    unwise = ['{', '}', '|', '\\', '^', '`'].concat(delims),

    // Allowed by RFCs, but cause of XSS attacks.  Always escape these.
    autoEscape = ['\''].concat(unwise),
    // Characters that are never ever allowed in a hostname.
    // Note that any invalid chars are also handled, but these
    // are the ones that are *expected* to be seen, so we fast-path
    // them.
    nonHostChars = ['%', '/', '?', ';', '#'].concat(autoEscape),
    hostEndingChars = ['/', '?', '#'],
    hostnameMaxLen = 255,
    hostnamePartPattern = /^[a-z0-9A-Z_-]{0,63}$/,
    hostnamePartStart = /^([a-z0-9A-Z_-]{0,63})(.*)$/,
    // protocols that can allow "unsafe" and "unwise" chars.
    unsafeProtocol = {
      'javascript': true,
      'javascript:': true
    },
    // protocols that never have a hostname.
    hostlessProtocol = {
      'javascript': true,
      'javascript:': true
    },
    // protocols that always contain a // bit.
    slashedProtocol = {
      'http': true,
      'https': true,
      'ftp': true,
      'gopher': true,
      'file': true,
      'http:': true,
      'https:': true,
      'ftp:': true,
      'gopher:': true,
      'file:': true
    },
    querystring = require('querystring');

function urlParse(url, parseQueryString, slashesDenoteHost) {
  if (url && isObject(url) && url instanceof Url) return url;

  var u = new Url;
  u.parse(url, parseQueryString, slashesDenoteHost);
  return u;
}

Url.prototype.parse = function(url, parseQueryString, slashesDenoteHost) {
  if (!isString(url)) {
    throw new TypeError("Parameter 'url' must be a string, not " + typeof url);
  }

  var rest = url;

  // trim before proceeding.
  // This is to support parse stuff like "  http://foo.com  \n"
  rest = rest.trim();

  var proto = protocolPattern.exec(rest);
  if (proto) {
    proto = proto[0];
    var lowerProto = proto.toLowerCase();
    this.protocol = lowerProto;
    rest = rest.substr(proto.length);
  }

  // figure out if it's got a host
  // user@server is *always* interpreted as a hostname, and url
  // resolution will treat //foo/bar as host=foo,path=bar because that's
  // how the browser resolves relative URLs.
  if (slashesDenoteHost || proto || rest.match(/^\/\/[^@\/]+@[^@\/]+/)) {
    var slashes = rest.substr(0, 2) === '//';
    if (slashes && !(proto && hostlessProtocol[proto])) {
      rest = rest.substr(2);
      this.slashes = true;
    }
  }

  if (!hostlessProtocol[proto] &&
      (slashes || (proto && !slashedProtocol[proto]))) {

    // there's a hostname.
    // the first instance of /, ?, ;, or # ends the host.
    //
    // If there is an @ in the hostname, then non-host chars *are* allowed
    // to the left of the last @ sign, unless some host-ending character
    // comes *before* the @-sign.
    // URLs are obnoxious.
    //
    // ex:
    // http://a@b@c/ => user:a@b host:c
    // http://a@b?@c => user:a host:c path:/?@c

    // v0.12 TODO(isaacs): This is not quite how Chrome does things.
    // Review our test case against browsers more comprehensively.

    // find the first instance of any hostEndingChars
    var hostEnd = -1;
    for (var i = 0; i < hostEndingChars.length; i++) {
      var hec = rest.indexOf(hostEndingChars[i]);
      if (hec !== -1 && (hostEnd === -1 || hec < hostEnd))
        hostEnd = hec;
    }

    // at this point, either we have an explicit point where the
    // auth portion cannot go past, or the last @ char is the decider.
    var auth, atSign;
    if (hostEnd === -1) {
      // atSign can be anywhere.
      atSign = rest.lastIndexOf('@');
    } else {
      // atSign must be in auth portion.
      // http://a@b/c@d => host:b auth:a path:/c@d
      atSign = rest.lastIndexOf('@', hostEnd);
    }

    // Now we have a portion which is definitely the auth.
    // Pull that off.
    if (atSign !== -1) {
      auth = rest.slice(0, atSign);
      rest = rest.slice(atSign + 1);
      this.auth = decodeURIComponent(auth);
    }

    // the host is the remaining to the left of the first non-host char
    hostEnd = -1;
    for (var i = 0; i < nonHostChars.length; i++) {
      var hec = rest.indexOf(nonHostChars[i]);
      if (hec !== -1 && (hostEnd === -1 || hec < hostEnd))
        hostEnd = hec;
    }
    // if we still have not hit it, then the entire thing is a host.
    if (hostEnd === -1)
      hostEnd = rest.length;

    this.host = rest.slice(0, hostEnd);
    rest = rest.slice(hostEnd);

    // pull out port.
    this.parseHost();

    // we've indicated that there is a hostname,
    // so even if it's empty, it has to be present.
    this.hostname = this.hostname || '';

    // if hostname begins with [ and ends with ]
    // assume that it's an IPv6 address.
    var ipv6Hostname = this.hostname[0] === '[' &&
        this.hostname[this.hostname.length - 1] === ']';

    // validate a little.
    if (!ipv6Hostname) {
      var hostparts = this.hostname.split(/\./);
      for (var i = 0, l = hostparts.length; i < l; i++) {
        var part = hostparts[i];
        if (!part) continue;
        if (!part.match(hostnamePartPattern)) {
          var newpart = '';
          for (var j = 0, k = part.length; j < k; j++) {
            if (part.charCodeAt(j) > 127) {
              // we replace non-ASCII char with a temporary placeholder
              // we need this to make sure size of hostname is not
              // broken by replacing non-ASCII by nothing
              newpart += 'x';
            } else {
              newpart += part[j];
            }
          }
          // we test again with ASCII char only
          if (!newpart.match(hostnamePartPattern)) {
            var validParts = hostparts.slice(0, i);
            var notHost = hostparts.slice(i + 1);
            var bit = part.match(hostnamePartStart);
            if (bit) {
              validParts.push(bit[1]);
              notHost.unshift(bit[2]);
            }
            if (notHost.length) {
              rest = '/' + notHost.join('.') + rest;
            }
            this.hostname = validParts.join('.');
            break;
          }
        }
      }
    }

    if (this.hostname.length > hostnameMaxLen) {
      this.hostname = '';
    } else {
      // hostnames are always lower case.
      this.hostname = this.hostname.toLowerCase();
    }

    if (!ipv6Hostname) {
      // IDNA Support: Returns a puny coded representation of "domain".
      // It only converts the part of the domain name that
      // has non ASCII characters. I.e. it dosent matter if
      // you call it with a domain that already is in ASCII.
      var domainArray = this.hostname.split('.');
      var newOut = [];
      for (var i = 0; i < domainArray.length; ++i) {
        var s = domainArray[i];
        newOut.push(s.match(/[^A-Za-z0-9_-]/) ?
            'xn--' + punycode.encode(s) : s);
      }
      this.hostname = newOut.join('.');
    }

    var p = this.port ? ':' + this.port : '';
    var h = this.hostname || '';
    this.host = h + p;
    this.href += this.host;

    // strip [ and ] from the hostname
    // the host field still retains them, though
    if (ipv6Hostname) {
      this.hostname = this.hostname.substr(1, this.hostname.length - 2);
      if (rest[0] !== '/') {
        rest = '/' + rest;
      }
    }
  }

  // now rest is set to the post-host stuff.
  // chop off any delim chars.
  if (!unsafeProtocol[lowerProto]) {

    // First, make 100% sure that any "autoEscape" chars get
    // escaped, even if encodeURIComponent doesn't think they
    // need to be.
    for (var i = 0, l = autoEscape.length; i < l; i++) {
      var ae = autoEscape[i];
      var esc = encodeURIComponent(ae);
      if (esc === ae) {
        esc = escape(ae);
      }
      rest = rest.split(ae).join(esc);
    }
  }


  // chop off from the tail first.
  var hash = rest.indexOf('#');
  if (hash !== -1) {
    // got a fragment string.
    this.hash = rest.substr(hash);
    rest = rest.slice(0, hash);
  }
  var qm = rest.indexOf('?');
  if (qm !== -1) {
    this.search = rest.substr(qm);
    this.query = rest.substr(qm + 1);
    if (parseQueryString) {
      this.query = querystring.parse(this.query);
    }
    rest = rest.slice(0, qm);
  } else if (parseQueryString) {
    // no query string, but parseQueryString still requested
    this.search = '';
    this.query = {};
  }
  if (rest) this.pathname = rest;
  if (slashedProtocol[lowerProto] &&
      this.hostname && !this.pathname) {
    this.pathname = '/';
  }

  //to support http.request
  if (this.pathname || this.search) {
    var p = this.pathname || '';
    var s = this.search || '';
    this.path = p + s;
  }

  // finally, reconstruct the href based on what has been validated.
  this.href = this.format();
  return this;
};

// format a parsed object into a url string
function urlFormat(obj) {
  // ensure it's an object, and not a string url.
  // If it's an obj, this is a no-op.
  // this way, you can call url_format() on strings
  // to clean up potentially wonky urls.
  if (isString(obj)) obj = urlParse(obj);
  if (!(obj instanceof Url)) return Url.prototype.format.call(obj);
  return obj.format();
}

Url.prototype.format = function() {
  var auth = this.auth || '';
  if (auth) {
    auth = encodeURIComponent(auth);
    auth = auth.replace(/%3A/i, ':');
    auth += '@';
  }

  var protocol = this.protocol || '',
      pathname = this.pathname || '',
      hash = this.hash || '',
      host = false,
      query = '';

  if (this.host) {
    host = auth + this.host;
  } else if (this.hostname) {
    host = auth + (this.hostname.indexOf(':') === -1 ?
        this.hostname :
        '[' + this.hostname + ']');
    if (this.port) {
      host += ':' + this.port;
    }
  }

  if (this.query &&
      isObject(this.query) &&
      Object.keys(this.query).length) {
    query = querystring.stringify(this.query);
  }

  var search = this.search || (query && ('?' + query)) || '';

  if (protocol && protocol.substr(-1) !== ':') protocol += ':';

  // only the slashedProtocols get the //.  Not mailto:, xmpp:, etc.
  // unless they had them to begin with.
  if (this.slashes ||
      (!protocol || slashedProtocol[protocol]) && host !== false) {
    host = '//' + (host || '');
    if (pathname && pathname.charAt(0) !== '/') pathname = '/' + pathname;
  } else if (!host) {
    host = '';
  }

  if (hash && hash.charAt(0) !== '#') hash = '#' + hash;
  if (search && search.charAt(0) !== '?') search = '?' + search;

  pathname = pathname.replace(/[?#]/g, function(match) {
    return encodeURIComponent(match);
  });
  search = search.replace('#', '%23');

  return protocol + host + pathname + search + hash;
};

function urlResolve(source, relative) {
  return urlParse(source, false, true).resolve(relative);
}

Url.prototype.resolve = function(relative) {
  return this.resolveObject(urlParse(relative, false, true)).format();
};

function urlResolveObject(source, relative) {
  if (!source) return relative;
  return urlParse(source, false, true).resolveObject(relative);
}

Url.prototype.resolveObject = function(relative) {
  if (isString(relative)) {
    var rel = new Url();
    rel.parse(relative, false, true);
    relative = rel;
  }

  var result = new Url();
  Object.keys(this).forEach(function(k) {
    result[k] = this[k];
  }, this);

  // hash is always overridden, no matter what.
  // even href="" will remove it.
  result.hash = relative.hash;

  // if the relative url is empty, then there's nothing left to do here.
  if (relative.href === '') {
    result.href = result.format();
    return result;
  }

  // hrefs like //foo/bar always cut to the protocol.
  if (relative.slashes && !relative.protocol) {
    // take everything except the protocol from relative
    Object.keys(relative).forEach(function(k) {
      if (k !== 'protocol')
        result[k] = relative[k];
    });

    //urlParse appends trailing / to urls like http://www.example.com
    if (slashedProtocol[result.protocol] &&
        result.hostname && !result.pathname) {
      result.path = result.pathname = '/';
    }

    result.href = result.format();
    return result;
  }

  if (relative.protocol && relative.protocol !== result.protocol) {
    // if it's a known url protocol, then changing
    // the protocol does weird things
    // first, if it's not file:, then we MUST have a host,
    // and if there was a path
    // to begin with, then we MUST have a path.
    // if it is file:, then the host is dropped,
    // because that's known to be hostless.
    // anything else is assumed to be absolute.
    if (!slashedProtocol[relative.protocol]) {
      Object.keys(relative).forEach(function(k) {
        result[k] = relative[k];
      });
      result.href = result.format();
      return result;
    }

    result.protocol = relative.protocol;
    if (!relative.host && !hostlessProtocol[relative.protocol]) {
      var relPath = (relative.pathname || '').split('/');
      while (relPath.length && !(relative.host = relPath.shift()));
      if (!relative.host) relative.host = '';
      if (!relative.hostname) relative.hostname = '';
      if (relPath[0] !== '') relPath.unshift('');
      if (relPath.length < 2) relPath.unshift('');
      result.pathname = relPath.join('/');
    } else {
      result.pathname = relative.pathname;
    }
    result.search = relative.search;
    result.query = relative.query;
    result.host = relative.host || '';
    result.auth = relative.auth;
    result.hostname = relative.hostname || relative.host;
    result.port = relative.port;
    // to support http.request
    if (result.pathname || result.search) {
      var p = result.pathname || '';
      var s = result.search || '';
      result.path = p + s;
    }
    result.slashes = result.slashes || relative.slashes;
    result.href = result.format();
    return result;
  }

  var isSourceAbs = (result.pathname && result.pathname.charAt(0) === '/'),
      isRelAbs = (
          relative.host ||
          relative.pathname && relative.pathname.charAt(0) === '/'
      ),
      mustEndAbs = (isRelAbs || isSourceAbs ||
                    (result.host && relative.pathname)),
      removeAllDots = mustEndAbs,
      srcPath = result.pathname && result.pathname.split('/') || [],
      relPath = relative.pathname && relative.pathname.split('/') || [],
      psychotic = result.protocol && !slashedProtocol[result.protocol];

  // if the url is a non-slashed url, then relative
  // links like ../.. should be able
  // to crawl up to the hostname, as well.  This is strange.
  // result.protocol has already been set by now.
  // Later on, put the first path part into the host field.
  if (psychotic) {
    result.hostname = '';
    result.port = null;
    if (result.host) {
      if (srcPath[0] === '') srcPath[0] = result.host;
      else srcPath.unshift(result.host);
    }
    result.host = '';
    if (relative.protocol) {
      relative.hostname = null;
      relative.port = null;
      if (relative.host) {
        if (relPath[0] === '') relPath[0] = relative.host;
        else relPath.unshift(relative.host);
      }
      relative.host = null;
    }
    mustEndAbs = mustEndAbs && (relPath[0] === '' || srcPath[0] === '');
  }

  if (isRelAbs) {
    // it's absolute.
    result.host = (relative.host || relative.host === '') ?
                  relative.host : result.host;
    result.hostname = (relative.hostname || relative.hostname === '') ?
                      relative.hostname : result.hostname;
    result.search = relative.search;
    result.query = relative.query;
    srcPath = relPath;
    // fall through to the dot-handling below.
  } else if (relPath.length) {
    // it's relative
    // throw away the existing file, and take the new path instead.
    if (!srcPath) srcPath = [];
    srcPath.pop();
    srcPath = srcPath.concat(relPath);
    result.search = relative.search;
    result.query = relative.query;
  } else if (!isNullOrUndefined(relative.search)) {
    // just pull out the search.
    // like href='?foo'.
    // Put this after the other two cases because it simplifies the booleans
    if (psychotic) {
      result.hostname = result.host = srcPath.shift();
      //occationaly the auth can get stuck only in host
      //this especialy happens in cases like
      //url.resolveObject('mailto:local1@domain1', 'local2@domain2')
      var authInHost = result.host && result.host.indexOf('@') > 0 ?
                       result.host.split('@') : false;
      if (authInHost) {
        result.auth = authInHost.shift();
        result.host = result.hostname = authInHost.shift();
      }
    }
    result.search = relative.search;
    result.query = relative.query;
    //to support http.request
    if (!isNull(result.pathname) || !isNull(result.search)) {
      result.path = (result.pathname ? result.pathname : '') +
                    (result.search ? result.search : '');
    }
    result.href = result.format();
    return result;
  }

  if (!srcPath.length) {
    // no path at all.  easy.
    // we've already handled the other stuff above.
    result.pathname = null;
    //to support http.request
    if (result.search) {
      result.path = '/' + result.search;
    } else {
      result.path = null;
    }
    result.href = result.format();
    return result;
  }

  // if a url ENDs in . or .., then it must get a trailing slash.
  // however, if it ends in anything else non-slashy,
  // then it must NOT get a trailing slash.
  var last = srcPath.slice(-1)[0];
  var hasTrailingSlash = (
      (result.host || relative.host) && (last === '.' || last === '..') ||
      last === '');

  // strip single dots, resolve double dots to parent dir
  // if the path tries to go above the root, `up` ends up > 0
  var up = 0;
  for (var i = srcPath.length; i >= 0; i--) {
    last = srcPath[i];
    if (last == '.') {
      srcPath.splice(i, 1);
    } else if (last === '..') {
      srcPath.splice(i, 1);
      up++;
    } else if (up) {
      srcPath.splice(i, 1);
      up--;
    }
  }

  // if the path is allowed to go above the root, restore leading ..s
  if (!mustEndAbs && !removeAllDots) {
    for (; up--; up) {
      srcPath.unshift('..');
    }
  }

  if (mustEndAbs && srcPath[0] !== '' &&
      (!srcPath[0] || srcPath[0].charAt(0) !== '/')) {
    srcPath.unshift('');
  }

  if (hasTrailingSlash && (srcPath.join('/').substr(-1) !== '/')) {
    srcPath.push('');
  }

  var isAbsolute = srcPath[0] === '' ||
      (srcPath[0] && srcPath[0].charAt(0) === '/');

  // put the host back
  if (psychotic) {
    result.hostname = result.host = isAbsolute ? '' :
                                    srcPath.length ? srcPath.shift() : '';
    //occationaly the auth can get stuck only in host
    //this especialy happens in cases like
    //url.resolveObject('mailto:local1@domain1', 'local2@domain2')
    var authInHost = result.host && result.host.indexOf('@') > 0 ?
                     result.host.split('@') : false;
    if (authInHost) {
      result.auth = authInHost.shift();
      result.host = result.hostname = authInHost.shift();
    }
  }

  mustEndAbs = mustEndAbs || (result.host && srcPath.length);

  if (mustEndAbs && !isAbsolute) {
    srcPath.unshift('');
  }

  if (!srcPath.length) {
    result.pathname = null;
    result.path = null;
  } else {
    result.pathname = srcPath.join('/');
  }

  //to support request.http
  if (!isNull(result.pathname) || !isNull(result.search)) {
    result.path = (result.pathname ? result.pathname : '') +
                  (result.search ? result.search : '');
  }
  result.auth = relative.auth || result.auth;
  result.slashes = result.slashes || relative.slashes;
  result.href = result.format();
  return result;
};

Url.prototype.parseHost = function() {
  var host = this.host;
  var port = portPattern.exec(host);
  if (port) {
    port = port[0];
    if (port !== ':') {
      this.port = port.substr(1);
    }
    host = host.substr(0, host.length - port.length);
  }
  if (host) this.hostname = host;
};

function isString(arg) {
  return typeof arg === "string";
}

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

function isNull(arg) {
  return arg === null;
}
function isNullOrUndefined(arg) {
  return  arg == null;
}

},{"punycode":35,"querystring":38}],40:[function(require,module,exports){
var domify = require('domify');

module.exports = hyperglue;

function hyperglue(el, data, opts) {
  if (!opts) opts = {};

  // if 'el' is an html string, turn it into dom elements
  if (typeof el === 'string') {
    el = domify(el);
  }

  // boundaries must be collected at the highest level possible
  if (opts.boundary && typeof opts.boundary !== 'object') {
    opts.boundary = el.querySelectorAll(opts.boundary);
  }

  // no data so we're done
  if (!data && data !== '') return el;

  // if data is an HTML element just replace whatever was there with it
  if (data instanceof Element) {
    while (el.childNodes.length) {
      el.removeChild(el.firstChild);
    }
    el.appendChild(data);
  }

  // elsewise assume other object types are hashes
  else if (typeof data === 'object') {
    for (var selector in data) {
      var value = data[selector];

      // plain text
      if (selector === '_text') {
        el.textContent = value;
      }

      // raw html
      else if (selector === '_html') {
        el.innerHTML = value;
      }

      // dom element
      else if (selector === '_element') {
        while (el.childNodes.length) {
          el.removeChild(el.firstChild);
        }
        el.appendChild(value);
      }

      // attribute setting
      else if (selector === '_attr') {
        for (var attr in value) {
          var val = value[attr];
          if (val === null || 
              val === undefined) {
            el.removeAttribute(attr);
          }
          else {
            el.setAttribute(attr, value[attr]);
          }
        }
      }

      // recursive
      else {

        // arrays need some extra setup so that they can be rendered
        // multiple times without disturbing neighboring elements
        var isArray = Array.isArray(value);
        var needsCache = false;
        var matches = null;
        if (isArray) {
          el.hyperglueArrays = el.hyperglueArrays || {};
          matches = el.hyperglueArrays[selector];
          if (!matches) {
            el.hyperglueArrays[selector] = [];
            needsCache = true;
          }
        }

        matches = matches || el.querySelectorAll(selector);
        for (var i=0; i<matches.length; i++) {
          var match = matches[i];

          // make sure match is not beyond a boundary
          if (opts.boundary) {
            var withinBoundary = true;
            for (var n=0; n<opts.boundary.length; n++) {
              if (opts.boundary[n].contains(match)) {
                withinBoundary = false;
                break;
              }
            }
            if (!withinBoundary) continue;
          }

          // render arrays
          if (isArray) {

            // in case the template contained multiple rows (we only use the first one)
            if (!match.parentNode) continue;

            // cache blueprint node
            if (needsCache && needsCache !== match.parent) {
              needsCache = match.parentNode;
              el.hyperglueArrays[selector].push({
                node: match.cloneNode(true),
                parentNode: match.parentNode,
                cloneNode: function() {
                  return this.node.cloneNode(true);
                }
              });
            }

            // remove any existing rows
            var parent = match.parentNode;
            while (parent.childNodes.length) {
              parent.removeChild(parent.childNodes[0]);
            }

            // render new rows
            for (var n in value) {
              var item = value[n];
              parent.appendChild(hyperglue(match.cloneNode(true), item));
            }
          }

          // render non-arrays
          else {
            hyperglue(match, value);
          }
        }
      }
    }
  }
  else {
    el.textContent = data;
  }

  return el;
};

},{"domify":41}],41:[function(require,module,exports){

/**
 * Expose `parse`.
 */

module.exports = parse;

/**
 * Tests for browser support.
 */

var div = document.createElement('div');
// Setup
div.innerHTML = '  <link/><table></table><a href="/a">a</a><input type="checkbox"/>';
// Make sure that link elements get serialized correctly by innerHTML
// This requires a wrapper element in IE
var innerHTMLBug = !div.getElementsByTagName('link').length;
div = undefined;

/**
 * Wrap map from jquery.
 */

var map = {
  legend: [1, '<fieldset>', '</fieldset>'],
  tr: [2, '<table><tbody>', '</tbody></table>'],
  col: [2, '<table><tbody></tbody><colgroup>', '</colgroup></table>'],
  // for script/link/style tags to work in IE6-8, you have to wrap
  // in a div with a non-whitespace character in front, ha!
  _default: innerHTMLBug ? [1, 'X<div>', '</div>'] : [0, '', '']
};

map.td =
map.th = [3, '<table><tbody><tr>', '</tr></tbody></table>'];

map.option =
map.optgroup = [1, '<select multiple="multiple">', '</select>'];

map.thead =
map.tbody =
map.colgroup =
map.caption =
map.tfoot = [1, '<table>', '</table>'];

map.text =
map.circle =
map.ellipse =
map.line =
map.path =
map.polygon =
map.polyline =
map.rect = [1, '<svg xmlns="http://www.w3.org/2000/svg" version="1.1">','</svg>'];

/**
 * Parse `html` and return a DOM Node instance, which could be a TextNode,
 * HTML DOM Node of some kind (<div> for example), or a DocumentFragment
 * instance, depending on the contents of the `html` string.
 *
 * @param {String} html - HTML string to "domify"
 * @param {Document} doc - The `document` instance to create the Node for
 * @return {DOMNode} the TextNode, DOM Node, or DocumentFragment instance
 * @api private
 */

function parse(html, doc) {
  if ('string' != typeof html) throw new TypeError('String expected');

  // default to the global `document` object
  if (!doc) doc = document;

  // tag name
  var m = /<([\w:]+)/.exec(html);
  if (!m) return doc.createTextNode(html);

  html = html.replace(/^\s+|\s+$/g, ''); // Remove leading/trailing whitespace

  var tag = m[1];

  // body support
  if (tag == 'body') {
    var el = doc.createElement('html');
    el.innerHTML = html;
    return el.removeChild(el.lastChild);
  }

  // wrap map
  var wrap = map[tag] || map._default;
  var depth = wrap[0];
  var prefix = wrap[1];
  var suffix = wrap[2];
  var el = doc.createElement('div');
  el.innerHTML = prefix + html + suffix;
  while (depth--) el = el.lastChild;

  // one element
  if (el.firstChild == el.lastChild) {
    return el.removeChild(el.firstChild);
  }

  // several elements
  var fragment = doc.createDocumentFragment();
  while (el.firstChild) {
    fragment.appendChild(el.removeChild(el.firstChild));
  }

  return fragment;
}

},{}],42:[function(require,module,exports){
if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
  };
} else {
  // old school shim for old browsers
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    var TempCtor = function () {}
    TempCtor.prototype = superCtor.prototype
    ctor.prototype = new TempCtor()
    ctor.prototype.constructor = ctor
  }
}

},{}],43:[function(require,module,exports){
module.exports = extend

function extend(target) {
    for (var i = 1; i < arguments.length; i++) {
        var source = arguments[i]

        for (var key in source) {
            if (source.hasOwnProperty(key)) {
                target[key] = source[key]
            }
        }
    }

    return target
}

},{}]},{},[1]);
