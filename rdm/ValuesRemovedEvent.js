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
goog.require('rdm.UndoableEvent');
// goog.require('rdm.ValuesAddedEvent');
goog.require('rdm.EventType');

rdm.ValuesRemovedEvent = function(target_, index, values) {
  rdm.UndoableEvent.call(this, rdm.EventType.VALUES_REMOVED, target_);
  this.bubbles = false;
  this.index = index;
  this.values = values;
};
goog.inherits(rdm.ValuesRemovedEvent, rdm.UndoableEvent);

rdm.ValuesRemovedEvent.prototype.getInverse = function() {
  return new rdm.ValuesAddedEvent(this.target_, this.index, this.values);
}
