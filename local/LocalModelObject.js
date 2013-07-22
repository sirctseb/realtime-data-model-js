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

rdm.local.LocalModelObject = function() {
  this.id = rdm.local.LocalModelObject.idNum_.toString();
  rdm.local.LocalModelObject.idNum_++;
};
rdm.local.LocalModelObject.idNum_ = 0;
rdm.local.LocalModelObject.inEmitEventsAndChangedScope_ = false;

// TODO implement custom objects
// Stream<rt.ValueChangedEvent> get onValueChanged => null; // TODO implement this getter

// create an emit a LocalObjectChangedEvent from a list of events
rdm.local.LocalModelObject.emitEventsAndChanged_ = function(controllers, events) {
  var terminal = !rdm.local.LocalModelObject.inEmitEventsAndChangedScope_;
  if(terminal) {
    rdm.local.LocalModelObject.inEmitEventsAndChangedScope_ = true;
  }
  // construct change event before firing actual events
  var event = new rdm.local.LocalObjectChangedEvent(this, events, terminal);
  for(int i = 0; i < events.length; i++) {
    // execute events
    this.executeEvent_(events[i]);
    // fire actual events
    this.controllers[i].add(events[i]);
  }
  // fire change event on normal stream
  this.onObjectChanged_.add(event);
  // fire on propagation stream
  this.onPostObjectChangedController_.add(event);
  if(terminal) {
    rdm.local.LocalModelObject.inEmitEventsAndChangedScope_ = false;
  }
};


rdm.local.LocalModelObject.executeAndEmitEvent_ = function(event) {
  // make change
  this.executeEvent_(event);
  // emit event
  this.eventStreamControllers_[event.type].add(event);
};


rdm.local.LocalModelObject.executeEvent_ = function(event) {
  // TODO implement custom objects
};


// TODO
// map from event type to stream controller they go on
// TODO with this we don't need to pass controllers to emitEventsAndChanged_
// Map<String, StreamController> eventStreamControllers_ = {};
