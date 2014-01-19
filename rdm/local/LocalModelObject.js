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

goog.provide('rdm.local.LocalModelObject');
goog.require('rdm.local.LocalObjectChangedEvent');
goog.require('rdm.local.EventTarget');

rdm.local.LocalModelObject = function() {
  rdm.local.EventTarget.call(this);
  this.id_ = rdm.local.LocalModelObject.idNum_.toString();
  rdm.local.LocalModelObject.idNum_++;
  Object.defineProperties(this, {
    'id': { get: function() { return this.id_; }}
  });
};
goog.inherits(rdm.local.LocalModelObject, rdm.local.EventTarget);
rdm.local.LocalModelObject.idNum_ = 0;
rdm.local.LocalModelObject.inEmitEventsAndChangedScope_ = false;


/**
 * @expose
 */
rdm.local.LocalModelObject.prototype.getId = function() {
  return this.id_;
};

// TODO implement custom objects

// create an emit a LocalObjectChangedEvent from a list of events
rdm.local.LocalModelObject.prototype.emitEventsAndChanged_ = function(events) {
  // record whether we're not in the scope of one of these calls yet
  var terminal = !rdm.local.LocalModelObject.inEmitEventsAndChangedScope_;
  // if not, set the static flag
  if(terminal) {
    rdm.local.LocalModelObject.inEmitEventsAndChangedScope_ = true;
  }
  // construct change event
  var event = new rdm.local.LocalObjectChangedEvent(this, events, terminal);
  for(var i = 0; i < events.length; i++) {
    // execute events
    this.executeEvent_(events[i]);
    // fire actual events
    this.dispatchEvent(events[i]);
  }
  // fire change event on normal stream
  this.dispatchEvent(event);
  if(terminal) {
    rdm.local.LocalModelObject.inEmitEventsAndChangedScope_ = false;
  }
};


rdm.local.LocalModelObject.prototype.executeAndEmitEvent_ = function(event) {
  // make change
  this.executeEvent_(event);
  // emit event
  this.dispatchEvent(event);
};


rdm.local.LocalModelObject.prototype.executeEvent_ = function(event) {
  // TODO implement custom objects
};
