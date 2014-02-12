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

goog.provide('rdm.local.ValuesAddedEvent');
goog.require('rdm.local.UndoableEvent');
// goog.require('rdm.local.ValuesRemovedEvent');
goog.require('rdm.EventType');

rdm.local.ValuesAddedEvent = function(target_, index, values) {
  rdm.local.UndoableEvent.call(this, rdm.EventType.VALUES_ADDED, target_);
  this.bubbles = false;
  this.index = index;
  this.values = values;
};
goog.inherits(rdm.local.ValuesAddedEvent, rdm.local.UndoableEvent);

rdm.local.ValuesAddedEvent.prototype.getInverse = function() {
  return new rdm.local.ValuesRemovedEvent(this.target_, this.index, this.values);
};
