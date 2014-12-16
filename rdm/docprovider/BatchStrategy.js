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

goog.provide('rdm.BatchStrategy');
goog.provide('rdm.ImmediateStrategy');
goog.provide('rdm.DelayStrategy');
goog.provide('rdm.SaveEvent');
goog.require('rdm.DocumentProvider');
goog.require('goog.events.EventTarget');

/**
 * An event that indicates that the document should be saved
 */
rdm.SaveEvent = function() {
};

/**
 * A class to determine when document changes should be saved to persistent storage
 */
rdm.BatchStrategy = function(model) {
  goog.events.EventTarget.call(this);
  model.getRoot().addEventListener(rdm.EventType.OBJECT_CHANGED,
    function(event) {
      this.modelChanged(event);
    });
};
goog.inherits(rdm.BatchStrategy, goog.events.EventTarget);

/**
 * Called when the model receives a change event
 * @interface
 */
rdm.BatchStrategy.prototype.modelChanged = function(event) {};

/**
 * Causes a save event to be fired on this
 */
rdm.BatchStrategy.prototype.save = function() {
  this.dispatchEvent(new SaveEvent());
};

/**
 * A strategy class to save immediately on every modification
 */
rdm.ImmediateStrategy = function(model) {
  rdm.BatchStrategy.call(this, model);
};
goog.inherits(rdm.ImmediateStrategy, rdm.BatchStrategy);

rdm.ImmediateStrategy.prototype.modelChanged = function(event) {
  // save on every change
  this.save();
};


/**
 * A strategy class that waits for a given duration after the last modification to save
 */
rdm.DelayStrategy = function(model, duration) {
  rdm.BatchStrategy.call(this, model);

  /**
   * The duration of time in ms to wait after the last modification.
   */
  this.duration = duration;

  /**
   * The id of the current timer
   * @private
   */
  this.timerId_ = null;
};
goog.inherits(rdm.DelayStrategy, rdm.BatchStrategy);

// save afer a given amount of time has passed since the last modification
rdm.DelayStrategy.prototype.modelChanged = function(event) {
  // TODO a better model for this whole thing might be to hae a repeating timer
  // TODO that checks if enough time has passed since last event instead of creating new timers every event

  // if there is already a timer running, cancel it
  if(this.timerId_ != null) {
    window.cancelTimer(this.timerId_);
    this.timerId_ = null;
  }

  var this_ = this;
  this.timerId_ = window.setTimeout(function() {
    // do save
    this_.save();
    // clear timer id
    this_.timerId_ = null;
  }, this.duration);
};
