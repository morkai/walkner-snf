// Copyright (c) 2015, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-snf project <http://lukasz.walukiewicz.eu/p/walkner-snf>

define([
  'underscore',
  'app/i18n',
  'app/user'
], function(
  _,
  t,
  user
) {
  'use strict';

  return function setUpUserSelect2($input, options)
  {
    return $input.select2(_.extend({
      openOnEnter: null,
      allowClear: true,
      minimumInputLength: 3,
      placeholder: t('users', 'select2:placeholder'),
      ajax: {
        cache: true,
        quietMillis: 300,
        url: function(term)
        {
          return '/users'
            + '?select(lastName,firstName,login)'
            + '&sort(lastName)'
            + '&limit(20)&regex(lastName,' + encodeURIComponent('^' + term.trim()) + ',i)';
        },
        results: function(data, page, query)
        {
          var root = user.getRootUserData();
          var results = [{
            _id: '$SYSTEM',
            text: t('users', 'select2:users:system'),
            name: t('users', 'select2:users:system'),
            login: null
          }, {
            _id: root._id,
            text: root.name || root.login,
            name: root.name || root.login,
            login: root.login
          }].filter(function(user)
          {
            return user.text.toLowerCase().indexOf(query.term.toLowerCase()) !== -1;
          });

          var users = results.concat(data.collection || []);

          if (options && options.userFilter)
          {
            users = users.filter(options.userFilter);
          }

          return {
            results: users.map(function(user)
            {
              var name = user.lastName && user.firstName
                ? (user.lastName + ' ' + user.firstName)
                : (user.name || '-');

              return {
                id: user._id,
                text: name,
                name: name,
                login: user.login
              };
            })
            .sort(function(a, b)
            {
              return a.text.localeCompare(b.text);
            })
          };
        }
      }
    }, options));
  };
});