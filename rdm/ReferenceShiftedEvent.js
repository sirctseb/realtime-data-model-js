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

goog.provide('rdm.ReferenceShiftedEvent');
goog.require('rdm.BaseModelEvent');
goog.require('rdm.EventType');

/**
 * Event fired when an index reference shifts.
 *
 * @constructor
 * @extends rdm.BaseModelEvent
 * @param {rdm.IndexReference} target The reference that shifted.
 * @param {number} oldIndex The previous index.
 * @param {number} newIndex The new index.
 */
rdm.ReferenceShiftedEvent = function(target, oldIndex, newIndex) {
  rdm.BaseModelEvent.call(this, rdm.EventType.REFERENCE_SHIFTED, target);
  this.bubbles = false;
  /**
   * The new index.
   * @type number
   */
  this.newIndex = newIndex;
  /**
   * The previous index.
   * @type number
   */
  this.oldIndex = oldIndex;
};
goog.inherits(rdm.ReferenceShiftedEvent, rdm.BaseModelEvent);
