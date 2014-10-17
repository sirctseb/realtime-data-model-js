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

goog.provide('rdm.UndoHistory');
goog.require('rdm.ObjectChangedEvent');
goog.require('rdm.UndoRedoStateChangedEvent');
goog.require('rdm.EventType')

/** [UndoHistory] manages the history of actions performed in the app */
rdm.UndoHistory = function(model) {
  this.model = model;
  this.history_ = [];
  /**
   * The current index into the undo history.
   * The changes specified by this.history_[0] through this.history_[this.index_ - 1] have been applied
   * and are stored as inverses of the original change. The changes specified by
   * this.history_[this.index_] throught this.history_[this.history_.length - 1] have been undone and
   * are stored as the original changed.
   * @private
   */
  this.index_ = 0;
  /**
   * The list of changes that constitute the currently developing compound operation. When the compound operation
   * is ended, this list will be added to the history at the current index.
   * @private
   */
  this.currentCO_ = null;
  /**
   * The stack of compound operation scopes. An entry is added each time beginCompoundOperation is called, and removed
   * each time endCompoundOperation is called.
   */
  this.COScopes_ = [];
  var this_ = this;
  // TODO document
  Object.defineProperties(this, {
    "canUndo": {
      get: function() { return this_.index_ > 0; }
    },
    "canRedo": {
      get: function() {
        return this_.index_ < this_.history_.length;
      }
    }
  });
};

rdm.UndoHistory.prototype.beginCompoundOperation = function(scope) {
  if(this.COScopes_.length == 0) {
    // create storage for operations in the CO
    this.currentCO_ = [];
  }
  this.COScopes_.push(scope);
};
// Complete the compound operation and add to the undo history
rdm.UndoHistory.prototype.endCompoundOperation = function() {
  var scope = this.COScopes_.pop();
  if(this.COScopes_.length == 0) {

    var currentCO = goog.array.clone(this.currentCO_);

    // invert the operations and reverse the order
    var inverseCO = this.currentCO_.map(function(op) {
      return op.getInverse_();
    }).reverse();
    // clear current CO
    this.currentCO_ = null;
    if(scope === rdm.UndoHistory.Scope.UNDO) {
      // if we started from an undo, replace history at current index with current CO
      this.history_[this.index_] = inverseCO;
    } else if(scope === rdm.UndoHistory.Scope.REDO) {
      // if we started from a redo, replace history at current index with current CO
      this.history_[this.index_] = inverseCO;
    } else if(scope !== rdm.UndoHistory.Scope.INIT) {
      // add to the history
      this.history_.splice(this.index_, this.history_.length, inverseCO);
      // update index
      this.index_++;
    }

    // fire events
    for(var event in currentCO) {
      currentCO[event].target.dispatchEvent(currentCO[event]);
    }
    // group by target
    var bucketed = goog.array.bucket(currentCO, function(el, index) {
      return rdm.custom.isCustomObject(el.target_) ?
        rdm.custom.getId(el.target_) : el.target_.id;
    });
    // do object changed events
    for(var id in bucketed) {
      var event = new rdm.ObjectChangedEvent(bucketed[id][0].target_, bucketed[id]);
      bucketed[id][0].target_.dispatchEvent(event);
    }
  }
};

rdm.UndoHistory.Scope = {
  NONE: 0,
  EXPLICIT_CO: 2,
  UNDO: 3,
  REDO: 4,
  INIT: 5
};
rdm.UndoHistory.prototype.scope = rdm.UndoHistory.Scope.NONE;

// Add a list of events to the current compound operation
rdm.UndoHistory.prototype.addUndoEvents_ = function(events, terminateSet) {
  if(this.COScopes_.length === 0 || this.COScopes_[0] !== rdm.UndoHistory.Scope.INIT) {
    Array.prototype.push.apply(this.currentCO_, events);
  }
};


rdm.UndoHistory.prototype.initializeModel = function(initialize) {
  // call initialization callback with scope set to INIT
  this.beginCompoundOperation(rdm.UndoHistory.Scope.INIT);
  initialize(this.model);
  this.endCompoundOperation();
};

rdm.UndoHistory.prototype.undo = function() {
  // store current undo/redo state
  var canUndo_ = this.canUndo;
  var canRedo_ = this.canRedo;

  // start compound operation
  this.beginCompoundOperation(rdm.UndoHistory.Scope.UNDO);

  // decrement index
  this.index_--;
  // do changes and events
  this.history_[this.index_].map(function(e) {
    e.updateState_();
    e.target_.executeAndEmitEvent_(e);
  });

  // unset undo scope flag
  this.endCompoundOperation();

  // if undo/redo state changed, send event
  if(canUndo_ != this.canUndo || canRedo_ != this.canRedo) {
    this.model.dispatchEvent(new rdm.UndoRedoStateChangedEvent(this.canRedo, this.canUndo));
  }
};


rdm.UndoHistory.prototype.redo = function() {
  // store current undo/redo state
  var canUndo_ = this.canUndo;
  var canRedo_ = this.canRedo;

  // start compound operation
  this.beginCompoundOperation(rdm.UndoHistory.Scope.REDO);

  // redo events
  this.history_[this.index_].map(function(e) {
    e.updateState_();
    e.target_.executeAndEmitEvent_(e);
  });

  this.endCompoundOperation();

  // increment index
  this.index_++;

  // if undo/redo state changed, send event
  if(canUndo_ != this.canUndo || canRedo_ != this.canRedo) {
    this.model.dispatchEvent(new rdm.UndoRedoStateChangedEvent(this.model, this.canUndo, this.canRedo));
  }
};

