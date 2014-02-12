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

goog.provide('rdm.local.ValueChangedEvent');
goog.require('rdm.local.UndoableEvent');
goog.require('rdm.EventType');

rdm.local.ValueChangedEvent = function(target_, property, newValue, oldValue) {
  rdm.local.UndoableEvent.call(this, rdm.EventType.VALUE_CHANGED, target_);
  this.bubbles = false;
  this.newValue = newValue;
  this.oldValue = oldValue;
  this.property = property;
};
goog.inherits(rdm.local.ValueChangedEvent, rdm.local.UndoableEvent);

rdm.local.ValueChangedEvent.prototype.getInverse = function() {
  return new rdm.local.ValueChangedEvent(this.target_, this.property, this.oldValue, this.newValue);
};

rdm.local.ValueChangedEvent.prototype.updateState_ = function() {
	this.oldValue = this.target_.get(this.property);
};
