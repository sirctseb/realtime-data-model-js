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

goog.provide('rdm.local.LocalUndoRedoStateChangedEvent');
goog.require('rdm.EventType');

rdm.local.LocalUndoRedoStateChangedEvent = function(target_, canUndo, canRedo) {
  goog.events.Event.call(this, rdm.EventType.UNDO_REDO_STATE_CHANGED, target_);
  this.canUndo = canUndo;
  this.canRedo = canRedo;
};
goog.inherits(rdm.local.LocalUndoRedoStateChangedEvent, goog.events.Event);