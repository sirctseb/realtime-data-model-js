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

goog.provide('rdm.ValuesSetEvent');
goog.require('rdm.UndoableEvent');
goog.require('rdm.EventType');

rdm.ValuesSetEvent = function(target_, index, newValues, oldValues) {
  rdm.UndoableEvent.call(this, rdm.EventType.VALUES_SET, target_);
  this.bubbles = false;
  this.index = index;
  this.newValues = newValues;
  this.oldValues = oldValues;
};
goog.inherits(rdm.ValuesSetEvent, rdm.UndoableEvent);

rdm.ValuesSetEvent.prototype.getInverse = function() {
  return new rdm.ValuesSetEvent(this.target_, this.index, this.oldValues, this.newValues);
};

rdm.ValuesSetEvent.prototype.updateState_ = function() {
  this.oldValues = this.target_.asArray().slice(this.index, this.index + this.newValues.length);
};
