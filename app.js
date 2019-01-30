const root = process.cwd(),
   path = require('path'),
   express = require('express'),
   fs = require('fs'),
   app = express(),
   resourcesPath = path.join('', 'application');

const global = (function() {
   return this || (0, eval)('this');
})();


const indexFile = fs.readFileSync(path.join(root, 'application', 'RouterDemo', 'index.html'), 'utf8');

const requirejs = require(path.join(root, 'node_modules', 'saby-units', 'lib', 'requirejs', 'r.js'));
global.requirejs = requirejs;


const createConfig = require(path.join(root, 'node_modules', 'sbis3-ws', 'WS.Core', 'ext', 'requirejs', 'config.js'));
const config = createConfig(path.join(root, 'application'),
   path.join(root, 'application', 'WS.Core'),
   path.join(root, 'application'),
   { lite: true });

global.require = global.requirejs = require = requirejs;
requirejs.config(config);



app.use(express.static(resourcesPath));

const port = process.env.PORT || 777;
app.listen(port);
console.log('app available on port ' + port);

console.log('start init');
require(['Core/core-init'], () => {
   console.log('core init success');
}, (err) => {
   console.log(err);
   console.log('core init failed');
});

app.get('/cdn*', (req, res) => {
   res.redirect('http://dev-cdn.wasaby.io' + req.url.slice(4));
});

app.get('/RouterDemo/*', (req, res) => {
   res.send(indexFile);
});


