'use strict';

var requirejsConfig = require('../../config/require');

module.exports = function startCoreRoutes(app, express)
{
  var appCache = app.options.env === 'production';
  var requirejsPaths = JSON.stringify(requirejsConfig.paths);
  var requirejsShim = JSON.stringify(requirejsConfig.shim);

  express.get('/', showIndex);

  express.get('/time', function(req, res)
  {
    res.send(Date.now().toString());
  });

  express.get('/config.js', sendRequireJsConfig);

  express.get('/snf.appcache', sendAppCacheManifest);

  function showIndex(req, res)
  {
    var sessionUser = req.session.user;
    var locale = sessionUser && sessionUser.locale ? sessionUser.locale : 'pl';

    // TODO: Add caching
    res.render('index', {
      appCache: appCache,
      appData: {
        TIME: JSON.stringify(Date.now()),
        LOCALE: JSON.stringify(locale),
        GUEST_USER: JSON.stringify(app.user.guest),
        PRIVILEGES: JSON.stringify(app.user.config.privileges),
        TAG_VALUES: JSON.stringify(app.controller.values),
        PROGRAM_OPTIONS: JSON.stringify({
          kinds: getProgramEnumValues('kind'),
          lightSourceTypes: getProgramEnumValues('lightSourceType'),
          bulbPowers: getProgramEnumValues('bulbPower'),
          ballasts: getProgramEnumValues('ballast'),
          ignitrons: getProgramEnumValues('ignitron'),
          interlocks: getProgramEnumValues('interlock')
        })
      }
    });
  }

  function sendRequireJsConfig(req, res)
  {
    res.type('js');
    res.render('config.js.ejs', {
      paths: requirejsPaths,
      shim: requirejsShim
    });
  }

  function sendAppCacheManifest(req, res)
  {
    if (appCache)
    {
      res.type('text/cache-manifest');
      res.sendfile('snf.appcache', {root: express.get('static path')});
    }
    else
    {
      res.send(404);
    }
  }

  function getProgramEnumValues(path)
  {
    return app.mongoose.model('Program').schema.path(path).enumValues;
  }
};
