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
goog.require('rdm.local.LocalValueChangedEvent');
goog.require('rdm.EventType');

rdm.local.LocalModelMap = function(initialValue) {
  rdm.local.LocalModelObject.call(this);
  this.map_ = initialValue || {};
  for(var key in this.map_) {
    if(this.map_[key] instanceof rdm.local.LocalModelObject) {
      this.map_[key].setParentEventTarget(this);
    }
  };
  var this_ = this;
  Object.defineProperties(this, {
    "size": { get: function() { return Object.keys(this_.map_).length; }}
  });
};
goog.inherits(rdm.local.LocalModelMap, rdm.local.LocalModelObject);


/**
 * @expose
 */
rdm.local.LocalModelMap.prototype.clear = function() {
  // remove each key and let it produce the event
  for(var key in this.map_) {
    // not using dot at behest of closure compiler
    this['delete'](key);
  }
};


// not using dot at behest of closure compiler
/**
 * @expose
 */
rdm.local.LocalModelMap.prototype['delete'] = function(key) {
  // save value for return
  var ret = this.map_[key] || null;
  // create the event
  var event = new rdm.local.LocalValueChangedEvent(this, key, null, this.map_[key]);
  // send the event
  this.emitEventsAndChanged_([event]);
  return ret;
};


/**
 * @expose
 */
rdm.local.LocalModelMap.prototype.get = function(key) {
  return this.map_[key] || null;
};


/**
 * @expose
 */
rdm.local.LocalModelMap.prototype.has = function(key) {
  return this.map_[key] != null;
};


/**
 * @expose
 */
rdm.local.LocalModelMap.prototype.isEmpty = function() {
  return this.map_.size == 0;
};


/**
 * @expose
 */
rdm.local.LocalModelMap.prototype.items = function() {
  return this.map_.keys().map(function(key) { return [key, this.map_[key]]; });
};


/**
 * @expose
 */
rdm.local.LocalModelMap.prototype.keys = function() {
  return this.map_.keys().slice(0);
};


/**
 * @expose
 */
rdm.local.LocalModelMap.prototype.set = function(key, value) {
  // save the current value for return
  var ret = this.map_[key];
  // send the event
  var event = new rdm.local.LocalValueChangedEvent(this, key, value, this.map_[key]);
  this.emitEventsAndChanged_([event]);
  return ret;
};


/**
 * @expose
 */
rdm.local.LocalModelMap.prototype.values = function() {
  return this.map_.keys().map(function(key) { return this.map_[key]; });
};


rdm.local.LocalModelMap.prototype.executeEvent_ = function(event) {
  if(event.type == rdm.EventType.VALUE_CHANGED) {
    this.map_[event.property] = event.newValue;
    if(this.map_[event.property] == null) {
      delete this.map_[event.property];
    }
    // stop propagating changes if we're writing over a model object
    // TODO so a collaborative object can't be in two other collaborative objects?
    if(event.oldValue instanceof rdm.local.LocalModelObject) {
      event.oldValue.setParentEventTarget(null);
    }
    // propagate changes on model data objects
    if(event.newValue instanceof rdm.local.LocalModelObject) {
      event.newValue.setParentEventTarget(this);
    }
  }
};