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

goog.provide('rdm.local.LocalObjectChangedEvent');
goog.require('rdm.local.LocalEvent');
goog.require('rdm.EventType');

rdm.local.LocalObjectChangedEvent = function(target_, events, isTerminal_) {
  rdm.local.LocalEvent.call(this, rdm.EventType.OBJECT_CHANGED, target_);
  // TODO I think this may be true for ObjectChanged and false for everything else?
  this.bubbles = null; // TODO implement this getter
  this.events = events;
  this.isTerminal_ = isTerminal_ || false;
};
goog.inherits(rdm.local.LocalObjectChangedEvent, rdm.local.LocalEvent);
