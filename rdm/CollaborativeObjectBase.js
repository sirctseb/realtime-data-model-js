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

goog.provide('rdm.CollaborativeObjectBase');
goog.require('rdm.EventTarget');
goog.require('rdm.ObjectChangedEvent');

// TODO(cjb) it would be better if this class didn't exist.
//     we would have to move both id_ and model_ into
//     EventTarget to get rid of it though
/**
 * A base class for collaborative objects and custom objects.
 *
 * @constructor
 * @extends {rdm.EventTarget}
 * @param {rdm.Model} model The document model
 */
rdm.CollaborativeObjectBase = function(model) {
  rdm.EventTarget.call(this);
  /**
   * The id of the collaborative object.
   *
   * @private
   */
  this.id_ = rdm.CollaborativeObjectBase.idNum_.toString();
  /**
   * The model that created the collaborative object.
   *
   * @private
   */
  this.model_ = model;
  rdm.CollaborativeObjectBase.idNum_++;
};
goog.inherits(rdm.CollaborativeObjectBase, rdm.EventTarget);

/**
 * Source of new id values for collaborative objects.
 *
 * @type {number}
 */
rdm.CollaborativeObjectBase.idNum_ = 0;

/**
 * Execute and fire the events given as well as an rdm.ObjectChangedEvent containing the events.
 *
 * @private
 * @param {Array.<rdm.BaseModelEvent>} events The events to fire.
 */
rdm.CollaborativeObjectBase.prototype.emitEventsAndChanged_ = function(events) {
  this.model_.beginCompoundOperation();
  // add events to undo history
  this.model_.undoHistory_.addUndoEvents_(events);
  // construct change event
  var event = new rdm.ObjectChangedEvent(this, events);
  for (var i = 0; i < events.length; i++) {
    // execute events
    this.executeEvent_(events[i]);
    // fire actual events
    this.dispatchEvent(events[i]);
  }
  // fire change event on normal stream
  this.dispatchEvent(event);
  this.model_.endCompoundOperation();
};


/**
 * Execute and fire the event given.
 *
 * @private
 * @param {rdm.BaseModelEvent} event The event to execute and fire.
 */
rdm.CollaborativeObjectBase.prototype.executeAndEmitEvent_ = function(event) {
  this.model_.beginCompoundOperation();

  // add events to undo history
  this.model_.undoHistory_.addUndoEvents_([event]);

  // make change
  this.executeEvent_(event);
  // emit event
  this.dispatchEvent(event);

  this.model_.endCompoundOperation();
};


/**
 * Make the modifications to the list described by the given event.
 *
 * @param {rdm.BaseModelEvent} event The event whose modifications should be
 *     applied to the object
 */
rdm.CollaborativeObjectBase.prototype.executeEvent_ = function(event) {};
