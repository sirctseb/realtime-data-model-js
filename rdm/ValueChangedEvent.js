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

goog.provide('rdm.ValueChangedEvent');
goog.require('rdm.EventType');
goog.require('rdm.UndoableEvent');

/**
 * Event fired when a map or custom object property changes.
 * @constructor
 * @extends rdm.UndoableEvent
 * @param {string} property The property whose value changed.
 * @param {*} newValue The new property value.
 * @param {*} oldValue The old property value.
 */
rdm.ValueChangedEvent = function(target, property, newValue, oldValue) {
  rdm.UndoableEvent.call(this, rdm.EventType.VALUE_CHANGED, target);
  this.bubbles = false;
  /**
   * The new property value.
   * @type *
   */
  this.newValue = newValue;
  /**
   * The old property value.
   * @type *
   */
  this.oldValue = oldValue;
  /**
   * The property whose value changed.
   * @type string
   */
  this.property = property;
};
goog.inherits(rdm.ValueChangedEvent, rdm.UndoableEvent);

/**
 * @inheritDoc
 */
rdm.ValueChangedEvent.prototype.getInverse = function() {
  return new rdm.ValueChangedEvent(this.target_, this.property, this.oldValue,
      this.newValue);
};

/**
 * @inheritDoc
 * @private
 */
rdm.ValueChangedEvent.prototype.updateState_ = function() {
  this.oldValue = this.target_.get(this.property);
};
