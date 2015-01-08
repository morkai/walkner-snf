// Copyright (c) 2015, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-snf project <http://lukasz.walukiewicz.eu/p/walkner-snf>

define([
  '../router',
  '../viewport',
  '../user',
  '../core/util/showDeleteFormPage',
  '../core/pages/DetailsPage',
  '../core/pages/AddFormPage',
  '../core/pages/EditFormPage',
  './User',
  './UserCollection',
  './pages/UserListPage',
  './views/UserDetailsView',
  './views/UserFormView',
  'i18n!app/nls/users'
], function(
  router,
  viewport,
  user,
  showDeleteFormPage,
  DetailsPage,
  AddFormPage,
  EditFormPage,
  User,
  UserCollection,
  UserListPage,
  UserDetailsView,
  UserFormView
) {
  'use strict';

  var canView = user.auth('USERS:VIEW');
  var canManage = user.auth('USERS:MANAGE');

  router.map('/users', canView, function(req)
  {
    viewport.showPage(new UserListPage({
      collection: new UserCollection(null, {rqlQuery: req.rql})
    }));
  });

  router.map(
    '/users/:id',
    function(req, referer, next)
    {
      if (req.params.id === user.data._id)
      {
        next();
      }
      else
      {
        canView(req, referer, next);
      }
    },
    function(req)
    {
      viewport.showPage(new DetailsPage({
        DetailsView: UserDetailsView,
        model: new User({_id: req.params.id})
      }));
    }
  );

  router.map('/users;add', canManage, function()
  {
    viewport.showPage(new AddFormPage({
      FormView: UserFormView,
      model: new User()
    }));
  });

  router.map('/users/:id;edit', canManage, function(req)
  {
    viewport.showPage(new EditFormPage({
      FormView: UserFormView,
      model: new User({_id: req.params.id})
    }));
  });

  router.map('/users/:id;delete', canManage, showDeleteFormPage.bind(null, User));
});
