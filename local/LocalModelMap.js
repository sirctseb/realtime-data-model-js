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

goog.provide('rdm.local.LocalModelMap');
goog.require('rdm.local.LocalModelObject');

rdm.local.LocalModelMap = function(initialValue) {
  rdm.local.LocalModelObject.call(this);
  this.map_ = initialValue || {};
  map_.map(function(key) {
    if(ssMap_[key] instanceof rdm.local.LocalModelObject) {
      ssMap_[key] = map_[key].onPostObjectChanged_.listen(function(e) {
        // fire normal change event
        onObjectChanged_.add(e);
        // fire on propagation stream
        onPostObjectChangedController_.add(e);
      });
    }
  });
  // TODO size property
  // TODO 
  // map of subscriptions for object changed events for model objects contained in this
  this.ssMap_ = {};
};
goog.inherits(rdm.local.LocalModelMap, rdm.local.LocalModel.Object);
  // // TODO event
  // @override void operator []=(String key, V value) {
  //   // send the event
  //   var event = new LocalValueChangedEvent._(value, map_[key], key, this);
  //   this.emitEventAndChanged_([onValueChanged_], [event]);
  // }


rdm.local.LocalModelMap.prototype.clear = function() {
  // remove each key and let it produce the event
  for(var key in this) {
    this.remove(key);
  }
};


rdm.local.LocalModelMap.prototype.delete = function(key) {
  // create the event
  var event = new rdm.local.LocalValueChangedEvent(this, null, map_[key], key);
  // send the event
  this.emitEventAndChanged_([onValueChanged_], [event]);
};


rdm.local.LocalModelMap.prototype.get = function(key) {
  return this[key];
};


rdm.local.LocalModelMap.prototype.has = function(key) {
  return map_[key] != null;
};


rdm.local.LocalModelMap.prototype.isEmpty = function() {
  return this.size == 0;
};


rdm.local.LocalModelMap.prototype.items = function() {
  return this.map_.keys().map(function(key) { return [key, this.map_[key]]; });
};


rdm.local.LocalModelMap.prototype.keys = function() {
  return map_.keys().slice(0);
};


rdm.local.LocalModelMap.prototype.set = function(key, value) {
  // send the event
  var event = new rdm.local.LocalValueChangedEvent(this, value, map_[key], key);
  this.emitEventAndChanged_([onValueChanged_], [event]);
  // TODO this is the wrong return value. should be the old value, not the new one
  return value;
};


// TODO return TypePromotingList object
rdm.local.LocalModelMap.prototype.values = function() {
  // TODO hasOwnProperty?
  return this.map_.keys().map(function(key) { this.map_[key]; });
};


// TODO 
// Stream<rt.ValueChangedEvent> get onValueChanged => onValueChanged_.stream;

rdm.local.LocalModelMap.executeEvent_ = function(event) {
  if(event.type == gapi.drive.realtime.EventType.VALUECHANGED) {
      this.map_[event.property] = event.newValue;
      // stop propagating changes if we're writing over a model object
      if(this.ssMap_[event.property]) {
        this.ssMap_[event.property].cancel();
        this.ssMap_[event.property] = null;
      }
      // propagate changes on model data objects
      if(event.newValue instanceof rdm.local.LocalModelObject) {
        this.ssMap_[event.property] = event.newValue.onPostObjectChanged_.listen(function(e) {
          // fire normal change event
          this.onObjectChanged_.add(e);
          // fire on propagation stream
          this.onPostObjectChangedController_.add(e);
        });
      }
  }
};
