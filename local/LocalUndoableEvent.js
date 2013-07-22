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

goog.provide('rdm.local.LocalUndoableEvent');

rdm.local.LocalUndoableEvent = function(type, target_) {
  rdm.local.LocalEvent(type, target_)
};
goog.inherits(rdm.local.LocalUndoableEvent, rdm.local.LocalEvent);


rdm.local.LocalUndoableEvent.prototype.executeAndEmit_ = function() {
  target_.executeAndEmitEvent_(this);
};
