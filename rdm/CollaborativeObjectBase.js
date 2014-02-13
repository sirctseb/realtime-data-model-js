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

goog.provide('rdm.CollaborativeObjectBase');
goog.require('rdm.ObjectChangedEvent');
goog.require('rdm.EventTarget');

rdm.CollaborativeObjectBase = function(model) {
  rdm.EventTarget.call(this);
  this.id_ = rdm.CollaborativeObjectBase.idNum_.toString();
  this.model_ = model;
  rdm.CollaborativeObjectBase.idNum_++;
};
goog.inherits(rdm.CollaborativeObjectBase, rdm.EventTarget);
rdm.CollaborativeObjectBase.idNum_ = 0;

rdm.CollaborativeObjectBase.prototype.emitEventsAndChanged_ = function(events) {
  this.model_.beginCompoundOperation();
  // add events to undo history
  this.model_.undoHistory_.addUndoEvents_(events);
  // construct change event
  var event = new rdm.ObjectChangedEvent(this, events);
  for(var i = 0; i < events.length; i++) {
    // execute events
    this.executeEvent_(events[i]);
    // fire actual events
    this.dispatchEvent(events[i]);
  }
  // fire change event on normal stream
  this.dispatchEvent(event);
  this.model_.endCompoundOperation();
};


rdm.CollaborativeObjectBase.prototype.executeAndEmitEvent_ = function(event) {
  this.model_.beginCompoundOperation();

  // add events to undo history
  this.model_.undoHistory_.addUndoEvents_([event]);

  // make change
  this.executeEvent_(event);
  // emit event
  this.dispatchEvent(event);

  this.model_.endCompoundOperation();
};


rdm.CollaborativeObjectBase.prototype.executeEvent_ = function(event) {};
