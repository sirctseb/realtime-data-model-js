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

rdm.local.LocalTextInsertedEvent = function(target_, index, text) {
  rdm.local.LocalUndoableEvent.call(this, gapi.drive.realtime.EventType.TEXT_INSERTED, target_);
  this.bubbles = null; // TODO implement this getter
  this.index = index;
  this.text = test;
};
goog.inherits(rdm.local.LocalTextInsertedEvent, rdm.local.LocalUndoableEvent);

rdm.local.LocalTextDeletedEvent.prototype.getInverse = function() {
  return new rdm.local.LocalTextDeletedEvent(this.target_, index, text);
};
