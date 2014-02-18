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

goog.provide('rdm.TextInsertedEvent');
goog.require('rdm.EventType');
goog.require('rdm.BaseModelEvent');

/**
 * Event fired when text is inserted into a string.
 *
 * @constructor
 * @extends rdm.BaseModelEvent
 * @param {rdm.CollaborativeString} target The target object that generated the
 *     event.
 * @param {number} index The index of the chnage.
 * @param {string} text The inserted text.
 */
rdm.TextInsertedEvent = function(target, index, text) {
  rdm.BaseModelEvent.call(this, rdm.EventType.TEXT_INSERTED, target);
  this.bubbles = false;
  /**
   * The index of the change.
   * @type number
   */
  this.index = index;
  /**
   * The inserted text.
   * @type string
   */
  this.text = text;
};
goog.inherits(rdm.TextInsertedEvent, rdm.BaseModelEvent);

/**
 * @inheritDoc
 */
rdm.TextInsertedEvent.prototype.getInverse = function() {
  return new rdm.TextDeletedEvent(this.target, this.index, this.text);
};
