// Copyright (c) 2015, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-snf project <http://lukasz.walukiewicz.eu/p/walkner-snf>

'use strict';

var fs = require('fs');
var path = require('path');
var lodash = require('lodash');
var multipart = require('express').multipart;
var step = require('h5.step');

module.exports = function setUpProgramsRoutes(app, programsModule)
{
  var express = app[programsModule.config.expressId];
  var userModule = app[programsModule.config.userId];
  var Program = app[programsModule.config.mongooseId].model('Program');

  var imagesPath = programsModule.config.imagesPath || './';
  var canManage = userModule.auth('PROGRAMS:MANAGE');

  express.get('/programs', express.crud.browseRoute.bind(null, app, Program));

  express.post('/programs', canManage, express.crud.addRoute.bind(null, app, Program));

  express.get('/programs/:id', express.crud.readRoute.bind(null, app, Program));

  express.put('/programs/:id', canManage, express.crud.editRoute.bind(null, app, Program));

  express.delete('/programs/:id', canManage, express.crud.deleteRoute.bind(null, app, Program));

  express.post('/programs/:program/images', canManage, multipart({limit: '5mb'}), uploadImagesRoute);

  express.get('/programs/:program/images/:image', sendImageRoute);

  express.put('/programs/:program/images/:image', canManage, editImageRoute);

  express.delete('/programs/:program/images/:image', canManage, deleteImageRoute);

  function uploadImagesRoute(req, res, next)
  {
    var imageFiles = lodash.filter(req.files, function(file)
    {
      return /^[A-Z0-9]+$/.test(file.fieldName) && /^image\/(jpeg|gif|png)$/.test(file.type);
    });

    if (!imageFiles.length)
    {
      return res.send(400);
    }

    var program = programsModule.modelsById[req.params.program];

    if (!program)
    {
      return res.send(404);
    }

    step(
      function uploadFilesStep(err)
      {
        this.images = [];

        for (var i = 0; i < imageFiles.length; ++i)
        {
          var imageFile = imageFiles[i];
          var imageType = resolveImageType(imageFile.type);
          var newFileName = imageFile.fieldName + '.' + imageType;
          var newFilePath = path.join(imagesPath, newFileName);

          fs.rename(imageFile.path, newFilePath, this.parallel());

          var image = {
            _id: imageFile.fieldName,
            type: imageType,
            label: imageFile.originalFilename.replace(/\..*?$/, '')
          };

          program.images.push(image);
          this.images.push(image);
        }
      },
      function updateProgramStep(err)
      {
        if (err)
        {
          return this.skip(err);
        }

        program.save(this.next());
      },
      function sendResponseStep(err)
      {
        if (err)
        {
          return next(err);
        }

        res.send(204);

        removeFiles(req.files);

        app.broker.publish('programs.' + req.params.program + '.images.added', {
          program: req.params.program,
          images: this.images
        });
      }
    );
  }

  function editImageRoute(req, res, next)
  {
    var program = programsModule.modelsById[req.params.program];

    if (!program)
    {
      return res.send(404);
    }

    var imageId = req.params.image.split('.')[0];

    step(
      function editImageStep(err)
      {
        if (err)
        {
          return this.skip(err);
        }

        this.image = lodash.find(program.images, function(image)
        {
          return image._id === imageId;
        });

        if (!this.image)
        {
          return this.skip(express.createHttpError('IMAGE_NOT_FOUND', 404));
        }

        this.image.label = req.body.label;

        program.markModified('images');
        program.save(this.next());
      },
      function sendResponseStep(err)
      {
        if (err)
        {
          return next(err);
        }

        res.send(204);

        app.broker.publish('programs.' + req.params.program + '.images.edited', {
          program: req.params.program,
          image: this.image
        });
      }
    );
  }

  function deleteImageRoute(req, res, next)
  {
    var program = programsModule.modelsById[req.params.program];

    if (!program)
    {
      return res.send(404);
    }

    var imageId = req.params.image.split('.')[0];

    step(
      function removeImageStep(err)
      {
        if (err)
        {
          return this.skip(err);
        }

        var imageIndex = lodash.findIndex(program.images, function(image) { return image._id === imageId; });

        if (imageIndex === -1)
        {
          return;
        }

        var image = program.images[imageIndex];

        program.images.splice(imageIndex, 1);
        program.markModified('images');
        program.save(this.next());

        this.imageFile = image._id + '.' + image.type;
      },
      function sendResponseStep(err)
      {
        if (err)
        {
          return next(err);
        }

        res.send(204);

        if (!this.imageFile)
        {
          return;
        }

        fs.unlink(path.join(imagesPath, this.imageFile), function() {});

        app.broker.publish('programs.' + req.params.program + '.images.deleted', {
          program: req.params.program,
          image: imageId
        });
      }
    );
  }

  function sendImageRoute(req, res, next)
  {
    if (!/^[A-Z0-9]+\.(jpg|png|gif)$/.test(req.params.image))
    {
      return res.send(400);
    }

    res.sendfile(path.join(imagesPath, req.params.image));
  }

  function resolveImageType(imageType)
  {
    switch (imageType)
    {
      case 'image/jpeg':
        return 'jpg';

      case 'image/png':
        return 'png';

      case 'image/gif':
        return 'gif';

      default:
        return 'img';
    }
  }

  function removeFiles(files)
  {
    Object.keys(files).forEach(function(key)
    {
      if (Array.isArray(files[key]))
      {
        files[key].forEach(function(file)
        {
          fs.unlink(file.path, function() {});
        });
      }
      else
      {
        fs.unlink(files[key].path, function() {});
      }
    });
  }
};
