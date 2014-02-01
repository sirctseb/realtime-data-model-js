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

goog.provide('rdm.local.UndoHistory');
goog.require('rdm.local.LocalObjectChangedEvent');
goog.require('rdm.local.LocalUndoRedoStateChangedEvent');
goog.require('rdm.EventType')

/** [UndoHistory] manages the history of actions performed in the app */
rdm.local.UndoHistory = function(model) {
  this.model = model;
  this.history_ = [];
  this.index_ = -1;
  var this_ = this;
  Object.defineProperties(this, {
    "canUndo": {
      get: function() { return this_.index_ > -1; }
    },
    "canRedo": {
      get: function() {
        var ret = this_.index_ < this_.history_.length - 1;
        return ret;
      }
    }
  });
};

rdm.local.UndoHistory.prototype.pushCompoundOperation = function() {
  // TODO update undo/redo state and fire event
  this.index_++;
  this.history_.splice(this.index_, this.history_.length, []);
};

rdm.local.UndoHistory.Scope = {
  NONE: 0,
  CO: 1,
  EXPLICIT_CO: 2,
  UNDO: 3,
  REDO: 4,
  INIT: 5
};
rdm.local.UndoHistory.prototype.scope = rdm.local.UndoHistory.Scope.NONE;
/**
 * Returns true if scope is at least rdm.local.UndoHistory.Scope.OC
 */
rdm.local.UndoHistory.prototype.inCO = function() {
  return this.scope_ >= rdm.local.UndoHistory.Scope.CO;
};
/**
 * If not already in an explicit compound operation or higher, raise scope to CO
 */
rdm.local.UndoHistory.prototype.beginCO = function() {
  if(this.scope_ < rdm.local.UndoHistory.Scope.CO) {
    this.scope_ = rdm.local.UndoHistory.Scope.CO;
    this.pushCompoundOperation();
  }
};
/**
 * If not in an explicit compound operation or higher, reduce the scope to NONE
 */
rdm.local.UndoHistory.prototype.endCO = function() {
  if(this.scope_ < rdm.local.UndoHistory.Scope.EXPLICIT_CO) {
    this.scope_ = rdm.local.UndoHistory.Scope.NONE;
  }
};
/**
 * Start explicit compound operation
 */
rdm.local.UndoHistory.prototype.beginExplicitCO = function() {
  // TODO error check current scope for explicitco, undo, redo. test what should happen if already in co
  // TODO probably if in co, we should set to explicitco but shouldn't start a new co
  this.scope_ = rdm.local.UndoHistory.Scope.EXPLICIT_CO;
  this.pushCompoundOperation();
};
rdm.local.UndoHistory.prototype.endExplicitCO = function() {
  // TODO error check current scope state
  this.scope_ = rdm.local.UndoHistory.Scope.NONE;
};

// Add a list of events to the current undo index
rdm.local.UndoHistory.prototype.addUndoEvents_ = function(events, terminateSet) {
  if(this.scope_ !== rdm.local.UndoHistory.Scope.INIT) {
    var prepend = this.scope_ === rdm.local.UndoHistory.Scope.UNDO || this.scope_ === rdm.local.UndoHistory.Scope.REDO;
    if(prepend) {
      Array.prototype.splice.apply(this.history_[this.index_], [0,0].concat(events));
    } else {
      Array.prototype.push.apply(this.history_[this.index_], events);
    }
  }
};


rdm.local.UndoHistory.prototype.initializeModel = function(initialize) {
  // call initialization callback with scope set to INIT
  this.scope_ = rdm.local.UndoHistory.Scope.INIT;
  initialize(this.model);
  this.scope_ = rdm.local.UndoHistory.Scope.NONE;
};

rdm.local.UndoHistory.prototype.undo = function() {
  // store current undo/redo state
  var canUndo_ = this.canUndo;
  var canRedo_ = this.canRedo;

  // set undo scope flag
  // TODO if we're not in NONE?
  this.scope_ = rdm.local.UndoHistory.Scope.UNDO;
  // save current events
  // TODO should have to reverse order
  var inverses = this.history_[this.index_].map(function(e) { return e.getInverse(); }).reverse();
  // put empty list in place
  this.history_[this.index_] = [];
  // do changes and events
  inverses.map(function(e) { console.log('executing event for undo:'); console.log(e); e.executeAndEmit_(); });
  // group by target
  var bucketed = goog.array.bucket(inverses, function(el, index) { return el.target_.id; })
  // do object changed events
  for(var id in bucketed) {
    var event = new rdm.local.LocalObjectChangedEvent(bucketed[id][0].target_, bucketed[id]);
    bucketed[id][0].target_.dispatchEvent(event);
  };
  // decrement index
  this.index_--;
  // unset undo scope flag
  this.scope_ = rdm.local.UndoHistory.Scope.NONE;

  // if undo/redo state changed, send event
  if(canUndo_ != this.canUndo || canRedo_ != this.canRedo) {
    this.model.dispatchEvent(new rdm.local.LocalUndoRedoStateChangedEvent(this.canRedo, this.canUndo));
  }
};


rdm.local.UndoHistory.prototype.redo = function() {
  // store current undo/redo state
  var canUndo_ = this.canUndo;
  var canRedo_ = this.canRedo;

  // set redo scope flag
  // TODO if scope is not NONE?
  this.scope_ = rdm.local.UndoHistory.Scope.REDO;
  // increment index
  this.index_++;
  // save current events
  // TODO should have to reverse order
  var inverses = this.history_[this.index_].map(function(e) { return e.getInverse(); });
  // put empty list in place
  this.history_[this.index_] = [];
  // redo events
  inverses.map(function(e) { e.executeAndEmit_(); });
  // group by target
  var bucketed = goog.array.bucket(inverses, function(el, index) { return el.target_.id; })
  // do object changed events
  for(var id in bucketed) {
    var event = new rdm.local.LocalObjectChangedEvent(bucketed[id][0].target_, bucketed[id]);
    bucketed[id][0].target_.dispatchEvent(event);
  };
  // uset redo scope flag
  this.scope_ = rdm.local.UndoHistory.Scope.NONE;

  // if undo/redo state changed, send event
  if(canUndo_ != this.canUndo || canRedo_ != this.canRedo) {
    this.model.dispatchEvent(new rdm.local.LocalUndoRedoStateChangedEvent(this.model, this.canUndo, this.canRedo));
  }
};

