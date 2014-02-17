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

goog.provide('rdm.ObjectChangedEvent');
goog.require('rdm.BaseModelEvent');
goog.require('rdm.EventType');

/**
 * Event fired when a collaborative object changes. This event will bubble to
 * all of the ancestors of the changed object. it includes an array of events
 * describing the specific changes.
 *
 * @constructor
 * @extends rdm.BaseModelEvent
 * @param {rdm.EventTarget} target The target object that generated the event.
 * @param {Array.<rdm.BaseModelevent>} events The events that caused the object
 *     to change.
 */
rdm.ObjectChangedEvent = function(target, events) {
  rdm.BaseModelEvent.call(this, rdm.EventType.OBJECT_CHANGED, target);
  this.bubbles = true;
  this.events = events;
};
goog.inherits(rdm.ObjectChangedEvent, rdm.BaseModelEvent);
