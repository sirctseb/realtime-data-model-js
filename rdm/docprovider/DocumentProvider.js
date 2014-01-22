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

goog.provide('rdm.DocumentProvider');

/**
 * A class to create a load realtime documents
 * @constructor
 * @interface
 */
rdm.DocumentProvider = function() {
  /**
   * The Document provided by this provider.
   * Null until the onFileLoaded callback passed to loadDocument is called
   */
  this.document = null;
};

/**
 * Load the document provided by this DocumentProvider
 * @interface
 */
rdm.DocumentProvider.prototype.loadDocument = function(onLoaded, opt_initializerFn, opt_errorFn) {};

/**
 * Export document to json format as returned by drive.realtime.get.
 * See https://developers.google.com/drive/v2/reference/realtime/get
 * The json format is undocumented as of 2013-8-15
 * @interface
 */
rdm.DocumentProvider.prototype.exportDocument = function(onExported) {};

/**
 * Returns a reference that can be assigned to an object prototype
 * field of a custom collaborative object in order to define custom
 * collaborative properties. For example:
 * MyClass.prototype.name = gapi.drive.realtime.custom.collaborativeField('name');
 * The resulting field can be read and assigned to like a regular field, but the
 * value will automatically be saved and sent to other collaborators.
 * @interface
 */
rdm.DocumentProvider.prototype.collaborativeField = function(name) {};

/**
 * Returns true if obj is a custom collaborative object, otherwise false.
 */
rdm.DocumentProvider.prototype.isCustomObject = function(obj) {};

/**
 * Registers a user-defined type as a collaborative type.
 * This must be called before {rdm.DocumentProvider.loadDocument}.
 */
rdm.DocumentProvider.prototype.registerType = function(type, name) {};

/**
 * Sets the initializer function for the given type.
 * The type must have already been registered with a call to registerType.
 */
rdm.DocumentProvider.prototype.setInitializer = function(type, initializerFn) {};

/**
 * Sets the onLoaded function for the given type.
 * The type must have already been registered with a call to registerType.
 */
rdm.DocumentProvider.prototype.setOnLoaded = function(type, opt_onLoadedFn) {};
