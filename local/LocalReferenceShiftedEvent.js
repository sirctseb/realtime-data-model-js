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

goog.provide('rdm.local.LocalReferenceShiftedEvent');

rdm.local.LocalReferenceShiftedEvent = function(target_, newIndex, oldIndex) {
  rdm.local.LocalEvent.call(this, gapi.drive.realtime.EventType.REFERENCE_SHIFTED, target_);
  this.bubbles = null; // TODO implement this getter
  this.newIndex = newIndex;
  this.oldIndex = oldIndex;
};
goog.inherits(rdm.local.LocalReferenceShiftedEvent, rdm.local.LocalEvent);