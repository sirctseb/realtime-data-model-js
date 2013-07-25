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
goog.require('goog.events.EventTarget');

rdm.local.LocalModelObject = function() {
  goog.events.EventTarget.call(this);
  this.id = rdm.local.LocalModelObject.idNum_.toString();
  rdm.local.LocalModelObject.idNum_++;
};
goog.inherits(rdm.local.LocalModelObject, goog.events.EventTarget);
rdm.local.LocalModelObject.idNum_ = 0;
rdm.local.LocalModelObject.inEmitEventsAndChangedScope_ = false;

// TODO implement custom objects
// Stream<rt.ValueChangedEvent> get onValueChanged => null; // TODO implement this getter

// create an emit a LocalObjectChangedEvent from a list of events
rdm.local.LocalModelObject.prototype.emitEventsAndChanged_ = function(events) {
  var terminal = !rdm.local.LocalModelObject.inEmitEventsAndChangedScope_;
  if(terminal) {
    rdm.local.LocalModelObject.inEmitEventsAndChangedScope_ = true;
  }
  // construct change event before firing actual events
  var event = new rdm.local.LocalObjectChangedEvent(this, events, terminal);
  for(var i = 0; i < events.length; i++) {
    // execute events
    this.executeEvent_(events[i]);
    // fire actual events
    this.dispatchEvent(events[i]);
  }
  // fire change event on normal stream
  this.dispatchEvent(event);
  // fire on propagation stream
  this.dispatchEvent(event.postEvent_);
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
