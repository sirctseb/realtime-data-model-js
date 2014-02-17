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

goog.provide('rdm.TextDeletedEvent');
goog.require('rdm.EventType');
goog.require('rdm.UndoableEvent');

/**
 * Event fired when text is removed from a string.
 *
 * @constructor
 * @extends rdm.UndoableEvent
 * @param {rdm.CollaborativeString} target The target object that generated the
 *     event.
 * @param {number} index The index of the change.
 * @param {string} text The deleted text.
 */
rdm.TextDeletedEvent = function(target, index, text) {
  rdm.UndoableEvent.call(this, rdm.EventType.TEXT_DELETED, target);
  /**
   * The index of the first character that was deleted.
   *
   * @type number
   */
  this.index = index;
  /**
   * The deleted text.
   *
   * @type string
   */
  this.text = text;
  this.bubbles = null;
};
goog.inherits(rdm.TextDeletedEvent, rdm.UndoableEvent);

/**
 * @inheritDoc
 */
rdm.TextDeletedEvent.prototype.getInverse = function() {
  return new rdm.TextInsertedEvent(this.target, this.index, this.text);
};
