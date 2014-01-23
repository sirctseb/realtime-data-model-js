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
goog.require('rdm.LocalDocumentProvider');

rdm.custom = {
  // TODO write function to safely check gapi.drive.realtime.isCustomObject when
  // gapi isn't loaded

  /**
   * Returns true if obj is a custom collaborative object, otherwise false.
   */
  isCustomObject: function(obj) {
    return (gapi.drive.realtime.isCustomObject(obj) || rdm.LocalDocumentProvider.isCustomObject_(obj));
  },

  /**
   * Returns the id of the given custom object.
   */
  getId: function(obj) {
    if(gapi.drive.realtime.isCustomObject(obj)) {
      return gapi.drive.realtime.custom.getId(obj);
    } else if(rdm.LocalDocumentProvider.isCustomObject_(obj)) {
      return rdm.LocalDocumentProvider.getId_(obj);
    } else {
      throw 'Object ' + obj + ' is not a custom object';
    }
  },

  /**
   * Returns the model for the given custom object.
   */
  getModel: function(obj) {
    if(gapi.drive.realtime.isCustomObject(obj)) {
      return gapi.drive.realtime.custom.getModel(obj);
    } else if(rdm.LocalDocumentProvider.isCustomObject_(obj)) {
      return rdm.LocalDocumentProvider.getModel_(obj);
    } else {
      throw 'Object ' + obj + ' is not a custom object';
    }
  }
};
