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

goog.provide('rdm.local.LocalModel');
goog.require('rdm.local.UndoHistory');
goog.require('rdm.local.LocalModelList');
goog.require('rdm.local.LocalModelMap');
goog.require('rdm.local.LocalModelString');
goog.require('rdm.local.LocalModelObject');
goog.require('rdm.local.LocalCustomObject');
goog.require('rdm.custom');
goog.require('rdm.custom.CollaborativeField_');
goog.require('goog.events.EventTarget');

rdm.local.LocalModel = function() {
  goog.events.EventTarget.call(this);

  // TODO is this ever true?
  this.isReadyOnly = false;
  // pass canUndo and canRedo through to undo history object
  Object.defineProperties(this, {
    "canUndo": { get: function() { return this.undoHistory_.canUndo; } },
    "canRedo": { get: function() { return this.undoHistory_.canRedo; } }
  });
  this.root_ = new rdm.local.LocalModelMap();
  this.isInitialized_ = false;
};
goog.inherits(rdm.local.LocalModel, goog.events.EventTarget);

rdm.local.LocalModel.prototype.initialize_ = function(initializeModel) {
  this.undoHistory_ = new rdm.local.UndoHistory(this);
  if(initializeModel != null) {
    this.undoHistory_.initializeModel(initializeModel);
  }
  this.isInitialized_ = true;
};

/**
 * Maps from names to {type, initializerFn, onLoadedFn} as registered by
 * rdm.LocalDocumentProvider.registerType, rdm.LocalDocumentProvider.setInitializer, and
 * rdm.LocalDocumentProvider.setOnLoaded
 * @private
 */
rdm.local.LocalModel.customTypes_ = {};

// TODO need to implement compound operations. meaningful for undo/redo
// TODO also, what is beginCreationCompoundOperation
/**
 * @expose
 */
rdm.local.LocalModel.prototype.beginCreationCompoundOperation = function() {};
/**
 * @expose
 */
rdm.local.LocalModel.prototype.endCompoundOperation = function() {};
/**
 * @expose
 */
rdm.local.LocalModel.prototype.getRoot = function() {
  return this.root_;
};

// TODO is this ever false?
/**
 * @expose
 */
rdm.local.LocalModel.prototype.isInitialized = function() {
  return isInitialized_;
};

// TODO need to implement compound operations. meaningful for undo/redo
/**
 * @expose
 */
rdm.local.LocalModel.prototype.beginCompoundOperation = function(name) {}

// TODO implement LocalModelObject and return here
/**
 * @expose
 */
rdm.local.LocalModel.prototype.create = function(ref, var_args) {
  var name = ref;
  if(goog.isString(ref)) {
    ref = rdm.local.LocalModel.customTypes_[ref].type;
  } else {
    name = rdm.local.LocalModel.customTypeName_(ref);
  }
  // TODO error if ref is now undefined
  // create instance
  var instance = new ref();
  // call local model object constructor
  rdm.local.LocalCustomObject.call(instance);
  // store id to model in map
  rdm.custom.customObjectModels_['' + rdm.custom.getId(instance)] = this;
  // replace collab fields by defining properties
  for(var prop in instance) {
    if(instance[prop] instanceof rdm.custom.CollaborativeField_) {
      Object.defineProperty(instance, prop, instance[prop].b);
    }
  }
  // run initializer function
  if(rdm.local.LocalModel.customTypes_[name].initializerFn) {
    rdm.local.LocalModel.customTypes_[name].initializerFn.apply(instance, var_args);
  }
  return instance;
};

/**
 * Given a registered custom object type, find the registered name
 * @private
 */
rdm.local.LocalModel.customTypeName_ = function(ref) {
  for(var name in rdm.local.LocalModel.customTypes_) {
    if(rdm.local.LocalModel.customTypes_[name].type === ref) {
      return name;
    }
  }
  throw ref + ' is not a registered custom object type';
};

/**
 * @expose
 */
rdm.local.LocalModel.prototype.createList = function(initialValue) {
  return new rdm.local.LocalModelList(initialValue);
};

/**
 * @expose
 */
rdm.local.LocalModel.prototype.createMap = function(initialValue) {
  return new rdm.local.LocalModelMap(initialValue);
};

/**
 * @expose
 */
rdm.local.LocalModel.prototype.createString = function(initialValue) {
  return new rdm.local.LocalModelString(initialValue);
}

/**
 * @expose
 */
rdm.local.LocalModel.prototype.undo = function() {
  if(!this.canUndo) return;
  // undo events
  this.undoHistory_.undo();
}

/**
 * @expose
 */
rdm.local.LocalModel.prototype.redo = function() {
  if(!this.canRedo) return;
  // redo events
  this.undoHistory_.redo();
}
