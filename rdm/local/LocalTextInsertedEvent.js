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

goog.provide('rdm.local.LocalTextInsertedEvent');
goog.require('rdm.local.LocalUndoableEvent');
// goog.require('rdm.local.LocalTextDeletedEvent');
goog.require('rdm.EventType');

rdm.local.LocalTextInsertedEvent = function(target_, index, text) {
  rdm.local.LocalUndoableEvent.call(this, rdm.EventType.TEXT_INSERTED, target_);
  this.bubbles = false;
  this.index = index;
  this.text = text;
};
goog.inherits(rdm.local.LocalTextInsertedEvent, rdm.local.LocalUndoableEvent);

rdm.local.LocalTextInsertedEvent.prototype.getInverse = function() {
  return new rdm.local.LocalTextDeletedEvent(this.target_, this.index, this.text);
};
