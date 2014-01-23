// Copyright (c) 2013, Christopher Best
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless addDependencyd by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

goog.provide('rdm.custom');
goog.require('rdm.GoogleDocProvider');
goog.require('rdm.local.LocalCustomObject');

rdm.custom = {
  // TODO write function to safely check gapi.drive.realtime.isCustomObject when
  // gapi isn't loaded

  /**
   * Returns true if obj is a custom collaborative object, otherwise false.
   */
  isCustomObject: function(obj) {
    return (gapi.drive.realtime.custom.isCustomObject(obj) || rdm.custom.isLocalCustomObject_(obj));
  },

  isLocalCustomObject_: function(obj) {
    return obj instanceof rdm.local.LocalCustomObject;
  },

  /**
   * Returns the id of the given custom object.
   */
  getId: function(obj) {
    if(gapi.drive.realtime.custom.isCustomObject(obj)) {
      return gapi.drive.realtime.custom.getId(obj);
    } else if(rdm.custom.isLocalCustomObject_(obj)) {
      return rdm.custom.getLocalId_(obj);
    } else {
      throw 'Object ' + obj + ' is not a custom object';
    }
  },

  getLocalId_: function(obj) {
    // TODO refactor a base class of LocalModelObject that doesn't have getId or id getter
    // and subclass LocalCustomObject from that
    // TODO then we will need to store ids on the model
    return obj.getId();
  },


  /**
   * Maps from object ids to the models that created the objects
   * @private
   */
  customObjectModels_: {},

  /**
   * Returns the model for the given custom object.
   */
  getModel: function(obj) {
    if(gapi.drive.realtime.custom.isCustomObject(obj)) {
      return gapi.drive.realtime.custom.getModel(obj);
    } else if(rdm.custom.isLocalCustomObject_(obj)) {
      return rdm.custom.getLocalModel_(obj);
    } else {
      throw 'Object ' + obj + ' is not a custom object';
    }
  },

  getLocalModel_: function(obj) {
    return rdm.custom.customObjectModels_['' + rdm.custom.getLocalId_(obj)];
  }
};
