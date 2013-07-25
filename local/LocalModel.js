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

rdm.local.LocalModel = function() {
  // TODO is this ever true?
  this.isReadyOnly = true;
  this.canUndo = false;
  this.canRedo = false;
  this.root_ = new rdm.local.LocalModelMap();
};

rdm.local.LocalModel.initialize_ = function(initializeModel) {
  this.undoHistory_ = new rdm.local.UndoHistory(this);
  if(initialize != null) {
    undoHistory_.initializeModel(initialize);
  }
};

// TODO need to implement compound operations. meaningful for undo/redo
// TODO also, what is beginCreationCompoundOperation
rdm.local.LocalModel.prototype.beginCreationCompoundOperation = function() {};
rdm.local.LocalModel.prototype.endCompoundOperation = function() {};
rdm.local.LocalModel.prototype.getRoot = function() {
  return this.root_;
};

// TODO is this ever false?
rdm.local.LocalModel.prototype.isInitialized = function() {
  return true;
};

// TODO need to implement compound operations. meaningful for undo/redo
rdm.local.LocalModel.prototype.beginCompoundOperation = function(name) {}

// TODO implement LocalModelObject and return here
rdm.local.LocalModel.prototype.create = function(ref, var_args) {
  return null;
};

rdm.local.LocalModel.prototype.createList = function(initialValue) {
  return new rdm.local.LocalModelList(initialValue);
};

rdm.local.LocalModel.prototype.createMap = function(initialValue) {
  return new rdm.local.LocalModelMap(initialValue);
};

rdm.local.LocalModel.prototype.createString = function(initialValue) {
  return new rdm.local.LocalModelString(initialValue);
}

rdm.local.LocalModel.prototype.undo = function() {
  // TODO check canUndo
  // undo events
  undoHistory_.undo();
}
rdm.local.LocalModel.prototype.redo = function() {
  // TODO check canRedo
  // redo events
  undoHistory_.redo();
}

// Stream<rt.UndoRedoStateChangedEvent> get onUndoRedoStateChanged => _onUndoRedoStateChanged.stream;
