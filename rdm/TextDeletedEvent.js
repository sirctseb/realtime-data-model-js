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
goog.require('rdm.UndoableEvent');
// goog.require('rdm.TextInsertedEvent');
goog.require('rdm.EventType');

rdm.TextDeletedEvent = function(target_, index, text) {
  rdm.UndoableEvent.call(this, rdm.EventType.TEXT_DELETED, target_);
  this.index = index;
  this.text = text;
  this.bubbles = null;
};
goog.inherits(rdm.TextDeletedEvent, rdm.UndoableEvent);

rdm.TextDeletedEvent.prototype.getInverse = function() {
  return new rdm.TextInsertedEvent(this.target_, this.index, this.text);
};
