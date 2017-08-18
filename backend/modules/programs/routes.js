// Copyright (c) 2015, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-snf project <http://lukasz.walukiewicz.eu/p/walkner-snf>

'use strict';

var os = require('os');
var fs = require('fs');
var path = require('path');
var _ = require('lodash');
var multer = require('multer');
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

  express.post(
    '/programs/:program/images',
    canManage,
    multer({
      dest: os.tmpdir(),
      limits: {
        files: 10,
        fileSize: 5 * 1024 * 1024
      }
    }).any(),
    uploadImagesRoute
  );

  express.get('/programs/:program/images/:image', sendImageRoute);

  express.put('/programs/:program/images/:image', canManage, editImageRoute);

  express.delete('/programs/:program/images/:image', canManage, deleteImageRoute);

  function uploadImagesRoute(req, res, next)
  {
    var imageFiles = _.filter(req.files, function(file)
    {
      return /^[A-Z0-9]+$/.test(file.fieldname) && /^image\/(jpeg|gif|png)$/.test(file.mimetype);
    });

    if (!imageFiles.length)
    {
      removeFiles(req.files);

      return res.sendStatus(400);
    }

    var program = programsModule.modelsById[req.params.program];

    if (!program)
    {
      removeFiles(req.files);

      return res.sendStatus(404);
    }

    step(
      function uploadFilesStep(err)
      {
        this.images = [];

        for (var i = 0; i < imageFiles.length; ++i)
        {
          var imageFile = imageFiles[i];
          var imageType = resolveImageType(imageFile.mimetype);
          var newFileName = imageFile.fieldname + '.' + imageType;
          var newFilePath = path.join(imagesPath, newFileName);

          fs.rename(imageFile.path, newFilePath, this.parallel());

          var image = {
            _id: imageFile.fieldname,
            type: imageType,
            label: imageFile.originalname.replace(/\..*?$/, '')
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

        res.sendStatus(204);

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

        this.image = _.find(program.images, function(image)
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

        var imageIndex = _.findIndex(program.images, function(image) { return image._id === imageId; });

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
    _.forEach(files, function(file)
    {
      fs.unlink(file.path, function() {});
    });
  }
};
