'use strict';

var lodash = require('lodash');

module.exports = function setUpVirtualTags(app, modbus)
{
  setUpMasterStatusTag();

  function setUpMasterStatusTag()
  {
    var controlProcessTag = modbus.tags['masters.controlProcess'];

    if (lodash.isUndefined(controlProcessTag))
    {
      modbus.warn("masters.controlProcess tag is not defined!");

      return;
    }

    var statusTags = [];

    lodash.each(modbus.config.controlMasters, function(controlMaster)
    {
      var master = modbus.masters[controlMaster];

      if (lodash.isObject(master))
      {
        statusTags.push('masters.' + controlMaster);
      }
    });

    var doCheckMasterControlStatus = checkControlProcessMastersStatus.bind(
      null, statusTags, controlProcessTag
    );

    lodash.each(statusTags, function(masterStatusTag)
    {
      app.broker.subscribe(
        'tagValueChanged.' + masterStatusTag, doCheckMasterControlStatus
      );
    });
  }

  function checkControlProcessMastersStatus(statusTags, controlProcessTag)
  {
    var newState = true;

    for (var i = 0, l = statusTags.length; i < l; ++i)
    {
      if (!modbus.values[statusTags[i]])
      {
        newState = false;

        break;
      }
    }

    controlProcessTag.setValue(newState);
  }
};
