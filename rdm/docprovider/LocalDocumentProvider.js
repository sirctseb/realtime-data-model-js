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

goog.provide('rdm.LocalDocumentProvider');
goog.require('rdm.DocumentProvider');
goog.require('rdm.local.LocalCustomObject');
goog.require('rdm.local.LocalModel');
goog.require('rdm.local.LocalDocument');

/**
 * A class to create local documents with no persistence
 * @constructor
 */
rdm.LocalDocumentProvider = function() {
  rdm.DocumentProvider.call(this);
};
goog.inherits(rdm.LocalDocumentProvider, rdm.DocumentProvider);

rdm.LocalDocumentProvider.prototype.loadDocument = function(onLoaded, opt_initializerFn, opt_errorFn) {
  // create the model object
  var model = new rdm.local.LocalModel();
  // initialize the model with callback
  model.initialize_(opt_initializerFn);
  // create the document
  this.document = new rdm.local.LocalDocument(model);
  // call the loaded callback
  onLoaded(this.document);
};

rdm.LocalDocumentProvider.exportDocument = function(onExported) {
  onExported(this.document.getModel().toJSON());
};

/**
 * Returns a reference that can be assigned to an object prototype
 * field of a custom collaborative object in order to define custom
 * collaborative properties. For example:
 * MyClass.prototype.name = gapi.drive.realtime.custom.collaborativeField('name');
 * The resulting field can be read and assigned to like a regular field, but the
 * value will automatically be saved and sent to other collaborators.
 * @interface
 */
rdm.LocalDocumentProvider.collaborativeField = function(name) {
  return new rdm.custom.CollaborativeField_(name);
};

/**
 * Returns true if obj is a custom collaborative object, otherwise false.
 * @private
 */
rdm.LocalDocumentProvider.isCustomObject_ = function(obj) {
  return obj instanceof rdm.local.LocalCustomObject;
};

/**
 * Registers a user-defined type as a collaborative type.
 * This must be called before {rdm.DocumentProvider.loadDocument}.
 */
rdm.LocalDocumentProvider.registerType = function(type, name) {
  rdm.local.LocalModel.customTypes_[name] = {type: type};
  goog.inherits(type, rdm.local.LocalCustomObject);
};

/**
 * Sets the initializer function for the given type.
 * The type must have already been registered with a call to registerType.
 */
rdm.LocalDocumentProvider.setInitializer = function(type, initializerFn) {
  for(var name in rdm.local.LocalModel.customTypes_) {
    if(rdm.local.LocalModel.customTypes_[name].type === type) {
      rdm.local.LocalModel.customTypes_[name].initializerFn = initializerFn;
      return;
    }
  }
};

/**
 * Sets the onLoaded function for the given type.
 * The type must have already been registered with a call to registerType.
 */
rdm.LocalDocumentProvider.setOnLoaded = function(type, opt_onLoadedFn) {
  for(var name in rdm.local.LocalModel.customTypes_) {
    if(rdm.local.LocalModel.customTypes_[name].type === type) {
      rdm.local.LocalModel.customTypes_[name].onLoadedFn = opt_onLoadedFn;
      return;
    }
  }
};
