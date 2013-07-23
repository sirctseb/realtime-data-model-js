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

/** [UndoHistory] manages the history of actions performed in the app */
// TODO events grouped into a single object changed event are still grouped
// TODO during undo in the realtime implementation, but are split up here
// TODO undo state events are not in the same order with respect to other events
// TODO as seen by client code. also rt sometimes sends two of the same events
rdm.local.UndoHistory_  = function(model) {
  this.model = model;
  this.history_ = [[]];
  this.index_ = 0;
  this.lastWasTerminal_ = false;
  this.undoScope_ = false;
  this.redoScope_ = false;
  this.initScope_ = false;
  Object.defineProperties(this, {
    "firstOfSet_": {
      get: function() { return this.lastWasTerminal_ && !this.undoScope_ && !this.redoScope_; }
    },
    "canUndo": {
      get: function() { return this.index_ > 0; }
    },
    "canRedo": {
      get: function() { return this.index_ < this.history_.length; }
    }
  });

  model.root.onObjectChanged.listen(function(e) {
    if(this.initScope_) {
      // don't add to undo history in initialization
    } else if(this.undoScope_) {
      // if undoing, add inverse of events to history
      this.addUndoEvents_(e.events, false, true);
    } else if(redoScope_) {
      // if redoing, add events to history
      this.addUndoEvents_(e.events, false, true);
    } else {
      // store current undo/redo state
      var canUndo_ = this.canUndo;
      var canRedo_ = this.canRedo;

      // add event to current undo set
      this.addUndoEvents_(e.events.slice(0).reverse(), e.isTerminal_);
      this.lastWasTerminal_ = e.isTerminal_;

      // if undo/redo state changed, send event
      if(canUndo_ != this.canUndo || canRedo_ != this.canRedo) {
        model.onUndoRedoStateChanged_.add(
            new rdm.local.LocalUndoRedoStateChangedEvent._(this.canRedo, this.canUndo));
      }
    }
  });
};


// Add a list of events to the current undo index
rdm.local.UndoHistory_.prototype.addUndoEvents_ = function(events, terminateSet, prepend) {
  terminateSet = terminateSet == undefined ? false : terminateSet;
  prepend = prepend == undefined ? false : prepend;
  // if this is the first of a set and we're not undoing or redoing,
  // truncate the history after this point
  if(this.firstOfSet_) {
    this.history_.splice(this.index_, this.history_.length, []);
  }
  if(prepend) {
    Array.splice.apply(this.history_[this.index_], [0,0].concat(events));
  } else {
    Array.push.apply(this.history_[this.index_], events);
  }
  if(terminateSet) {
    this.history_.push([]);
    this.index_++;
  }
};


rdm.local.UndoHistory.prototype.initializeModel = function(initialize, model) {
  // call initialization callback with initScope_ set to true
  this.initScope_ = true;
  initialize(m);
  this.initScope_ = false;
};

rdm.local.UndoHistory.prorotype.undo = function() {
  // store current undo/redo state
  var canUndo_ = this.canUndo;
  var canRedo_ = this.canRedo;

  // set undo latch
  this.undoScope_ = true;
  // decrement index
  this.index_--;
  // save current events
  var inverses = this.history_[this.index_].map(function(e) { return e.getInverse(); });
  // put empty list in place
  this.history_[this.index_] = [];
  // do changes and events
  inverses.map(function(e) { e.executeAndEmit_(); });
  // do object changed events
  inverses.map(function(e) {
    var event = new LocalObjectChangedEvent._([e], e.target_);
    e.target_.onObjectChanged_.add(event);
    e.target_.onPostObjectChangedController_.add(event);
  });
  // unset undo latch
  this.undoScope_ = false;

  // if undo/redo state changed, send event
  if(canUndo_ != this.canUndo || canRedo_ != this.canRedo) {
    model.onUndoRedoStateChanged_.add(
      new rdm.local.LocalUndoRedoStateChangedEvent._(this.canRedo, this.canUndo));
  }
};


rdm.local.UndoHistory.prototype.redo = function() {
  // store current undo/redo state
  var canUndo_ = this.canUndo;
  var canRedo_ = this.canRedo;

  // set redo latch
  this.redoScope_ = true;
  // save current events
  var inverses = this.history_[this.index_].map(function(e) { return e.getInverse(); });
  // put empty list in place
  this.history_[this.index_] = [];
  // redo events
  inverses.map(function(e) { e.executeAndEmit_(); });
  // do object changed events
  inverses.map(function(e) {
    var event = new LocalObjectChangedEvent._([e], e.target_);
    e.target_.onObjectChanged_.add(event);
    e.target_.onPostObjectChangedController_.add(event);
  });
  // increment index
  this.index_++;
  // uset redo latch
  this.redoScope_ = false;

  // if undo/redo state changed, send event
  if(canUndo_ != this.canUndo || canRedo_ != this.canRedo) {
    model.onUndoRedoStateChanged_.add(
      new rdm.local.LocalUndoRedoStateChangedEvent._(this.canRedo, this.canUndo));
  }
}

