// Part of <https://miracle.systems/p/walkner-snf> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/i18n',
  'app/broker',
  'app/socket'
],
function(
  _,
  t,
  broker,
  socket
) {
  'use strict';

  var embedded = document.body.classList.contains('is-embedded');
  var reloadLocks = [];
  var reloadLockI = 0;
  var user = {};

  socket.on('user.reload', function(userData)
  {
    user.reload(userData);
  });

  socket.on('user.deleted', function()
  {
    window.location.reload();
  });

  var guestUser = _.assign(window.GUEST_USER || {}, {
    name: t.bound('core', 'GUEST_USER_NAME')
  });

  delete window.GUEST_USER;

  user.data = guestUser;

  user.lang = window.APP_LOCALE || window.appLocale || 'pl';

  user.noReload = false;

  user.isReloadLocked = function()
  {
    return reloadLocks.length > 0;
  };

  user.lockReload = function()
  {
    return reloadLocks.push(++reloadLockI);
  };

  user.unlockReload = function(lockI)
  {
    reloadLocks = reloadLocks.filter(function(i) { return i !== lockI; });
  };

  /**
   * @param {Object} userData
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
        userData.name = t.bound('core', 'GUEST_USER_NAME');
      }

      if (userData.orgUnitType === 'unspecified')
      {
        userData.orgUnitType = null;
        userData.orgUnitId = null;
      }

      user.data = userData;
    }

    user.data.privilegesMap = null;

    if (user.noReload)
    {
      user.noReload = false;
    }
    else
    {
      broker.publish('user.reloaded');
    }

    if (wasLoggedIn && !user.isLoggedIn())
    {
      broker.publish('user.loggedOut');
    }
    else if (!wasLoggedIn && user.isLoggedIn())
    {
      broker.publish('user.loggedIn');
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
   * @param {boolean} [firstNameFirst]
   * @returns {string}
   */
  user.getLabel = function(firstNameFirst)
  {
    if (user.data.name)
    {
      return String(user.data.name);
    }

    if (user.data.lastName && user.data.firstName)
    {
      if (user.data.lastName === user.data.firstName)
      {
        return user.data.lastName;
      }

      if (firstNameFirst)
      {
        return user.data.firstName + ' ' + user.data.lastName;
      }

      return user.data.lastName + ' ' + user.data.firstName;
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
      cname: window.COMPUTERNAME,
      label: user.getLabel()
    };
  };

  user.isAllowedTo = function(privilege)
  {
    if (user.data.active === false)
    {
      return false;
    }

    if (user.data.super)
    {
      return true;
    }

    var userPrivileges = user.data.privileges;
    var args = Array.prototype.slice.call(arguments);
    var anyPrivileges = (args.length === 1 ? [privilege] : args).map(function(p)
    {
      return Array.isArray(p) ? p : [p];
    });

    if (anyPrivileges.length
      && user.data.local
      && anyPrivileges[0].some(function(privilege) { return privilege === 'LOCAL'; }))
    {
      return true;
    }

    if (!userPrivileges)
    {
      return false;
    }

    var isLoggedIn = user.isLoggedIn();

    if (!anyPrivileges.length)
    {
      return isLoggedIn;
    }

    for (var i = 0, l = anyPrivileges.length; i < l; ++i)
    {
      var allPrivileges = anyPrivileges[i];
      var actualMatches = 0;
      var requiredMatches = allPrivileges.length;

      for (var ii = 0; ii < requiredMatches; ++ii)
      {
        var requiredPrivilege = allPrivileges[ii];

        if (typeof requiredPrivilege !== 'string')
        {
          requiredMatches -= 1;

          continue;
        }

        if (requiredPrivilege === 'USER')
        {
          actualMatches += isLoggedIn ? 1 : 0;
        }
        else if (/^FN:/.test(requiredPrivilege))
        {
          actualMatches += user.data.prodFunction === requiredPrivilege.substring(3) ? 1 : 0;
        }
        else
        {
          actualMatches += user.hasPrivilege(allPrivileges[ii]) ? 1 : 0;
        }
      }

      if (actualMatches === requiredMatches)
      {
        return true;
      }
    }

    return false;
  };

  user.auth = function()
  {
    var anyPrivileges = Array.prototype.slice.call(arguments);

    return function(req, referer, next)
    {
      if (user.isAllowedTo.apply(user, anyPrivileges))
      {
        next();
      }
      else if (!user.isLoggedIn())
      {
        require(['app/viewport', 'app/users/pages/LogInFormPage'], function(viewport, LogInFormPage)
        {
          viewport.showPage(new LogInFormPage());
        });
      }
      else
      {
        require(['app/viewport', 'app/core/pages/ErrorPage'], function(viewport, ErrorPage)
        {
          viewport.showPage(new ErrorPage({
            model: {
              code: 403,
              req: req,
              previousUrl: referer
            }
          }));
        });
      }
    };
  };

  user.hasPrivilege = function(privilege)
  {
    if (!user.data.privilegesMap)
    {
      if (!Array.isArray(user.data.privileges))
      {
        user.data.privileges = [];
      }

      user.data.privilegesString = '|' + user.data.privileges.join('|');
      user.data.privilegesMap = {};

      _.forEach(user.data.privileges, function(privilege) { user.data.privilegesMap[privilege] = true; });
    }

    if (privilege.charAt(privilege.length - 1) === '*')
    {
      return user.data.privilegesString.indexOf('|' + privilege.substr(0, privilege.length - 1)) !== -1;
    }

    return user.data.privilegesMap[privilege] === true;
  };

  user.getGuestUserData = function()
  {
    return window.GUEST_USER || {
      id: null,
      login: 'guest',
      name: t.bound('core', 'GUEST_USER_NAME'),
      loggedIn: false,
      super: false,
      privileges: []
    };
  };

  user.getRootUserData = function()
  {
    return window.ROOT_USER || {
      id: null,
      login: 'root',
      name: 'root',
      loggedIn: true,
      super: true,
      privileges: []
    };
  };

  user.can = {
    commentOrders: function()
    {
      return user.isAllowedTo(
        'ORDERS:MANAGE', 'ORDERS:COMMENT',
        'PLANNING:PLANNER', 'PLANNING:WHMAN', 'PAINT_SHOP:PAINTER',
        'WH:VIEW',
        'FN:master', 'FN:leader'
      );
    }
  };

  window.user = user;

  return user;
});
