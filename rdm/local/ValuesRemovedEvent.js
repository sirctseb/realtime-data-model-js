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

goog.provide('rdm.local.ValuesRemovedEvent');
goog.require('rdm.local.UndoableEvent');
// goog.require('rdm.local.ValuesAddedEvent');
goog.require('rdm.EventType');

rdm.local.ValuesRemovedEvent = function(target_, index, values) {
  rdm.local.UndoableEvent.call(this, rdm.EventType.VALUES_REMOVED, target_);
  this.bubbles = false;
  this.index = index;
  this.values = values;
};
goog.inherits(rdm.local.ValuesRemovedEvent, rdm.local.UndoableEvent);

rdm.local.ValuesRemovedEvent.prototype.getInverse = function() {
  return new rdm.local.ValuesAddedEvent(this.target_, this.index, this.values);
}
