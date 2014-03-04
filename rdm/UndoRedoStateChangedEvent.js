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

goog.provide('rdm.UndoRedoStateChangedEvent');
goog.require('rdm.EventType');

/**
 * An event indicating that canUndo or canRedo changed.
 *
 * @constructor
 * @extends goog.events.Event
 * @param {rdm.Model} model Themodel whose state changed.
 * @param {boolean} canUndo True if you can currently undo.
 * @param {boolean} canRedo True if you can currently redo.
 */
rdm.UndoRedoStateChangedEvent = function(model, canUndo, canRedo) {
  goog.events.Event.call(this, rdm.EventType.UNDO_REDO_STATE_CHANGED, model);
  /**
   * True if you can currently redo, false otherwise.
   * @type boolean
   */
  this.canUndo = canUndo;
  /**
   * True if you can currently undo, false otherwise.
   */
  this.canRedo = canRedo;
};
goog.inherits(rdm.UndoRedoStateChangedEvent, goog.events.Event);
