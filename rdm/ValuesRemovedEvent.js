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

goog.provide('rdm.ValuesRemovedEvent');
goog.require('rdm.EventType');
goog.require('rdm.BaseModelEvent');

/**
 * Event fired when items are removed from a collaborative list.
 * @constructor
 * @extends rdm.BaseModelEvent
 * @param {rdm.CollaborativeList} target The target object that generated the
 *     event.
 * @param {number} index The index where values were removed.
 * @param {Array.<*>} values The values removed.
 */
rdm.ValuesRemovedEvent = function(target, index, values) {
  rdm.BaseModelEvent.call(this, rdm.EventType.VALUES_REMOVED, target);
  this.bubbles = false;
  /**
   * The index of the first removed value.
   * @type number
   */
  this.index = index;
  /**
   * The values that were removed.
   * @type Array.<!Object|string|number|boolean>
   */
  this.values = values;
};
goog.inherits(rdm.ValuesRemovedEvent, rdm.BaseModelEvent);

/**
 * @inheritDoc
 */
rdm.ValuesRemovedEvent.prototype.getInverse_ = function() {
  return new rdm.ValuesAddedEvent(this.target_, this.index, this.values);
};
