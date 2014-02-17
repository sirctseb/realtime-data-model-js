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

goog.provide('rdm.ValuesSetEvent');
goog.require('rdm.EventType');
goog.require('rdm.UndoableEvent');

/**
 * Event fired when items in a collaborative list are changed in place.
 * @constructor
 * @extends rdm.UndoableEvent
 * @param {rdm.CollaborativeList} target The target object that generated the
 *     event.
 * @param {number} index The index of the change.
 * @param {Array.<*>} oldValues The old values.
 * @param {Array.<*>} newValues The new values.
 */
rdm.ValuesSetEvent = function(target, index, oldValues, newValues) {
  rdm.UndoableEvent.call(this, rdm.EventType.VALUES_SET, target);
  this.bubbles = false;
  /**
   * The index of the first value that was replaced.
   * @type number
   */
  this.index = index;
  /**
   * The new values.
   * @type Array.<*>
   */
  this.newValues = newValues;
  /**
   * The oldValues.
   * @type Array.<*>
   */
  this.oldValues = oldValues;
};
goog.inherits(rdm.ValuesSetEvent, rdm.UndoableEvent);

/**
 * @inheritDoc
 */
rdm.ValuesSetEvent.prototype.getInverse = function() {
  return new rdm.ValuesSetEvent(this.target_, this.index, this.newValues,
      this.oldValues);
};

/**
 * @inheritDoc
 * @private
 */
rdm.ValuesSetEvent.prototype.updateState_ = function() {
  this.oldValues = this.target_.asArray().slice(this.index,
      this.index + this.newValues.length);
};
