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

goog.provide('rdm.BaseModelEvent');
goog.require('goog.events.Event');

/**
 * A base class for model events.
 * @constructor
 * @extends {goog.events.Event}
 *
 * @param {string} type The event type.
 * @param {rdm.EventTarget} target The target object that generated the event.
 */
rdm.BaseModelEvent = function(type, target) {
  goog.events.Event.call(this, type, target);

  this.target_ = target;
};
goog.inherits(rdm.BaseModelEvent, goog.events.Event);

/**
* Whether or not this event should bubble to ancestors.
* @type {boolean}
*/
rdm.BaseModelEvent.prototype.bubbles = false;

/**
* Whether this event originated in the local session.
* @type {boolean}
*/
// in the local implementation, all events are local
rdm.BaseModelEvent.prototype.isLocal = true;

/**
* The id of the session that initiated the event.
* @type {string}
*/
// no sessionId or userId in the local implementation
rdm.BaseModelEvent.prototype.sessionId = null;

/**
* Event type.
* @type {string}
*/
rdm.BaseModelEvent.prototype.type = null;

/**
* The user id of the user that initiated the event.
* @type {string}
*/
rdm.BaseModelEvent.prototype.userId = null;
