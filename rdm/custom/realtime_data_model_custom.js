// Copyright (c) 2013, Christopher Best
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

goog.provide('rdm.custom');
goog.require('rdm.GoogleDocProvider');

rdm.custom = {

  /**
   * Registers a user-defined type as a collaborative type. This must be called before {@code rdm.DocumentProvider.loadDocument}.
   */
  registerType: function(type, name) {
    // do realtime registration
    if(rdm.GoogleDocProvider.globallySetup_) {
      gapi.drive.realtime.custom.registerType(type, name);
    }
  },

  /**
   * Adds a custom collaborative property to the type. For example:
   * rdm.custom.collaborativeField(MyClass, 'name');
   * Instances of MyClass created by rdm.Model.create will have a field that can be read and assigned to
   * like a regular field, but the value will automatically be saved and sent to other collaborators.
   */
  collaborativeField: function(type, name) {
    if(rdm.GoogleDocProvider.globallySetup_) {
      // add realtime collaborative field to type prototype
      type.prototype[name] = gapi.drive.realtime.custom.collaborativeField(name);
    }
  },

  /**
   * Sets the initializer function for the given type.
   * The type must have already been registered with a call to registerType.
   */
  setInitializer: function(type, initializerFn) {
    // set realtime initializer
    if(rdm.GoogleDocProvider.globallySetup_) {
      gapi.drive.realtime.custom.setInitializer(type, initializerFn);
    }
  },

  /**
   * Sets the onLoaded function for the given type.
   * The type must have already been registered with a call to registerType.
   */
  setOnLoaded: function(type, opt_onLoadedFn) {
    // set realtime loaded function
    if(rdm.GoogleDocProvider.globallySetup_) {
      gapi.drive.realtime.custom.setOnLoaded(type, opt_onLoadedFn);
    }
  },

  /**
   * Returns true if obj is a custom collaborative object, otherwise false.
   */
  isCustomObject: function(obj) {
    return rdm.GoogleDocProvider.globallySetup_ &&
      gapi.drive.realtime.custom.isCustomObject(obj);
  },

  /**
   * Returns the id of the given custom object.
   */
  getId: function(obj) {
    if(rdm.GoogleDocProvider.globallySetup_ &&
      gapi.drive.realtime.custom.isCustomObject(obj)) {
      return gapi.drive.realtime.custom.getId(obj);
    }
  },

  /**
   * Returns the model for the given custom object.
   */
  getModel: function(obj) {
    if(rdm.GoogleDocProvider.globallySetup_ &&
      gapi.drive.realtime.custom.isCustomObject(obj)) {
      return gapi.drive.realtime.custom.getModel(obj);
    }
  }
};
