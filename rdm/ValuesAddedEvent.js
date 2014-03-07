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

goog.provide('rdm.ValuesAddedEvent');
goog.require('rdm.EventType');
goog.require('rdm.BaseModelEvent');

/**
 * Event fired when items are added to a collaborative list.
 * @constructor
 * @extends rdm.BaseModelEvent
 * @param {rdm.CollaborativeList} target The target object that generated the
 *     event.
 * @param {number} index The index where values were added.
 * @param {Array.<*>} values The values added.
 */
rdm.ValuesAddedEvent = function(target, index, values) {
  rdm.BaseModelEvent.call(this, rdm.EventType.VALUES_ADDED, target);
  this.bubbles = false;
  /**
   * The index of the first added value.
   * @type number
   */
  this.index = index;
  /**
   * The values that were added.
   * @type Array.<!Object|string|number|boolean>
   */
  this.values = values;
};
goog.inherits(rdm.ValuesAddedEvent, rdm.BaseModelEvent);

/**
 * @inheritDoc
 */
rdm.ValuesAddedEvent.prototype.getInverse_ = function() {
  return new rdm.ValuesRemovedEvent(this.target_, this.index, this.values);
};
