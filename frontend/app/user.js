define([
  'jquery',
  'underscore',
  './i18n',
  './broker',
  './socket',
  './viewport',
  './core/pages/ErrorPage'
],
function(
  $,
  _,
  t,
  broker,
  socket,
  viewport,
  ErrorPage
) {
  'use strict';

  var computerName = null;

  if (window.location.search.indexOf('COMPUTERNAME=') !== -1)
  {
    window.location.search.substr(1).split('&').forEach(function(keyValue)
    {
      keyValue = keyValue.split('=');

      if (keyValue[0] === 'COMPUTERNAME' && keyValue[1])
      {
        computerName = keyValue[1];
      }
    });
  }

  var user = {};

  socket.on('user.reload', function(userData)
  {
    user.reload(userData);
  });

  user.data = _.extend(window.GUEST_USER || {}, {
    name: t('core', 'GUEST_USER_NAME')
  });

  delete window.GUEST_USER;

  /**
   * @param {object} userData
   */
  user.reload = function(userData)
  {
    if (_.isEqual(userData, user.data))
    {
      return;
    }

    var wasLoggedIn = user.isLoggedIn();

    if (_.isObject(userData) && Object.keys(userData).length > 0)
    {
      if (userData.loggedIn === false)
      {
        userData.name = t('core', 'GUEST_USER_NAME');
      }

      user.data = userData;
    }

    broker.publish('user.reloaded');

    if (wasLoggedIn && !user.isLoggedIn())
    {
      broker.publish('user.loggedOut');
    }
  };

  /**
   * @returns {boolean}
   */
  user.isLoggedIn = function()
  {
    return user.data.loggedIn === true;
  };

  /**
   * @returns {string}
   */
  user.getLabel = function()
  {
    if (user.data.name)
    {
      return user.data.name;
    }

    if (user.data.lastName && user.data.firstName)
    {
      return user.data.firstName + ' ' + user.data.lastName;
    }

    return user.data.login;
  };

  /**
   * @returns {{id: string, label: string, ip: string, cname: string}}
   */
  user.getInfo = function()
  {
    return {
      id: user.data._id,
      ip: user.data.ip || user.data.ipAddress || '0.0.0.0',
      cname: computerName,
      label: user.getLabel()
    };
  };

  /**
   * @param {string|Array.<string>} [privilege]
   * @returns {boolean}
   */
  user.isAllowedTo = function(privilege)
  {
    if (user.data.super)
    {
      return true;
    }

    var userPrivileges = user.data.privileges;

    if (!userPrivileges)
    {
      return false;
    }

    if (!privilege || privilege.length === 0)
    {
      return user.isLoggedIn();
    }

    var privileges = [].concat(privilege);
    var matches = 0;

    for (var i = 0, l = privileges.length; i < l; ++i)
    {
      privilege = privileges[i];

      if (typeof privilege !== 'string')
      {
        continue;
      }

      var privilegeRe = new RegExp('^' + privilege.replace('*', '.*?') + '$');

      for (var ii = 0, ll = userPrivileges.length; ii < ll; ++ii)
      {
        if (privilegeRe.test(userPrivileges[ii]))
        {
          ++matches;

          break;
        }
      }
    }

    return matches === privileges.length;
  };

  /**
   * @param {string|Array.<string>} privilege
   * @returns {function(app.core.Router, string, function)}
   */
  user.auth = function(privilege)
  {
    return function(req, referer, next)
    {
      if (user.isAllowedTo(privilege))
      {
        next();
      }
      else
      {
        viewport.showPage(new ErrorPage({code: 401, req: req, referer: referer}));
      }
    };
  };

  window.user = user;

  return user;
});
