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

goog.provide('rdm.local.LocalValueChangedEvent');
goog.require('rdm.local.LocalUndoableEvent');

rdm.local.LocalValueChangedEvent = function(target_, property, newValue, oldValue) {
  rdm.local.LocalUndoableEvent.call(this, gapi.drive.realtime.EventType.VALUE_CHANGED, target_);
  rdm.bubbles = null; // TODO implement this getter
  rdm.newValue = newValue;
  rdm.oldValue = oldValue;
  this.property = property;
};
goog.inherits(rdm.local.LocalValueChangedEvent, rdm.local.LocalUndoableEvent);

rdm.local.LocalValueChangedEvent.getInverse = function() {
  return new rdm.local.LocalValueChangedEvent(this.target_, property, newValue, oldValue);
};

