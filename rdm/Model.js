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

goog.provide('rdm.Model');
goog.require('rdm.UndoHistory');
goog.require('rdm.CollaborativeList');
goog.require('rdm.CollaborativeMap');
goog.require('rdm.CollaborativeString');
goog.require('rdm.CollaborativeObject');
goog.require('rdm.CustomObject');
goog.require('rdm.custom');
goog.require('goog.events.EventTarget');

rdm.Model = function() {
  goog.events.EventTarget.call(this);

  this.isReadyOnly = false;
  // pass canUndo and canRedo through to undo history object
  Object.defineProperties(this, {
    "canUndo": { get: function() { return this.undoHistory_.canUndo; } },
    "canRedo": { get: function() { return this.undoHistory_.canRedo; } }
  });
  this.root_ = this.createMap();
  this.isInitialized_ = false;
};
goog.inherits(rdm.Model, goog.events.EventTarget);

rdm.Model.prototype.initialize_ = function(initializeModel) {
  this.undoHistory_ = new rdm.UndoHistory(this);
  if(initializeModel != null) {
    this.undoHistory_.initializeModel(initializeModel);
  }
  this.isInitialized_ = true;
};

/**
 * @expose
 */
rdm.Model.prototype.beginCreationCompoundOperation = function() {};
/**
 * @expose
 */
rdm.Model.prototype.endCompoundOperation = function() {
  this.undoHistory_.endCompoundOperation();
};
/**
 * @expose
 */
rdm.Model.prototype.getRoot = function() {
  return this.root_;
};

/**
 * @expose
 */
rdm.Model.prototype.isInitialized = function() {
  return isInitialized_;
};

/**
 * @expose
 */
rdm.Model.prototype.beginCompoundOperation = function(name) {
  this.undoHistory_.beginCompoundOperation(rdm.UndoHistory.Scope.EXPLICIT_CO);
};

/**
 * @expose
 */
rdm.Model.prototype.create = function(ref, var_args) {
  var name = ref;
  if(goog.isString(ref)) {
    ref = rdm.CustomObject.customTypes_[ref].type;
  } else {
    name = rdm.CustomObject.customTypeName_(ref);
  }
  // create instance
  var instance = new ref();
  // extend with local custom object
  goog.object.extend(instance, rdm.CustomObject.prototype);
  // store instance in global list
  rdm.CustomObject.instances_.push(instance);
  // call local model object constructor
  rdm.CustomObject.call(instance, this);
  // store id to model in map
  rdm.custom.customObjectModels_['' + rdm.custom.getId(instance)] = this;
  // replace collab fields by defining properties
  for(var field in rdm.CustomObject.customTypes_[name].fields) {
    Object.defineProperty(instance, field, rdm.CustomObject.customTypes_[name].fields[field]);
  }
  // run initializer function
  if(rdm.CustomObject.customTypes_[name].initializerFn) {
    rdm.CustomObject.customTypes_[name].initializerFn.apply(instance, var_args);
  }
  return instance;
};

/**
 * @expose
 */
rdm.Model.prototype.createList = function(initialValue) {
  return new rdm.CollaborativeList(this, initialValue);
};

/**
 * @expose
 */
rdm.Model.prototype.createMap = function(initialValue) {
  return new rdm.CollaborativeMap(this, initialValue);
};

/**
 * @expose
 */
rdm.Model.prototype.createString = function(initialValue) {
  return new rdm.CollaborativeString(this, initialValue);
}

/**
 * @expose
 */
rdm.Model.prototype.undo = function() {
  if(!this.canUndo) return;
  // undo events
  this.undoHistory_.undo();
}

/**
 * @expose
 */
rdm.Model.prototype.redo = function() {
  if(!this.canRedo) return;
  // redo events
  this.undoHistory_.redo();
}
