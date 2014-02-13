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

goog.provide('rdm.CollaborativeMap');
goog.require('rdm.CollaborativeObject');
goog.require('rdm.ValueChangedEvent');
goog.require('rdm.EventType');

rdm.CollaborativeMap = function(model, initialValue) {
  rdm.CollaborativeObject.call(this, model);
  this.map_ = initialValue || {};
  for(var key in this.map_) {
    if(this.map_[key] instanceof rdm.CollaborativeObject) {
      this.map_[key].setParentEventTarget(this);
    }
  };
  var this_ = this;
  Object.defineProperties(this, {
    "size": { get: function() { return Object.keys(this_.map_).length; }}
  });
};
goog.inherits(rdm.CollaborativeMap, rdm.CollaborativeObject);


/**
 * @expose
 */
rdm.CollaborativeMap.prototype.clear = function() {
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
rdm.CollaborativeMap.prototype['delete'] = function(key) {
  // save value for return
  var ret = this.map_[key] || null;
  // create the event
  var event = new rdm.ValueChangedEvent(this, key, null, this.map_[key]);
  // send the event
  this.emitEventsAndChanged_([event]);
  return ret;
};


/**
 * @expose
 */
rdm.CollaborativeMap.prototype.get = function(key) {
  return this.map_[key] === undefined ? null : this.map_[key];
};


/**
 * @expose
 */
rdm.CollaborativeMap.prototype.has = function(key) {
  return this.map_[key] !== undefined;
};


/**
 * @expose
 */
rdm.CollaborativeMap.prototype.isEmpty = function() {
  return this.map_.size === 0;
};


/**
 * @expose
 */
rdm.CollaborativeMap.prototype.items = function() {
  return Object.keys(this.map_).map(function(key) { return [key, this.map_[key]]; });
};


/**
 * @expose
 */
rdm.CollaborativeMap.prototype.keys = function() {
  return Object.keys(this.map_).slice(0);
};


/**
 * @expose
 */
rdm.CollaborativeMap.prototype.set = function(key, value) {
  // TODO check what is returned by rt when they fix
  // http://stackoverflow.com/questions/21563791/why-doesnt-collaborativemap-set-return-the-old-map-value
  // don't do anything if current value is already new value
  if(this.map_[key] === value) return value;
  // save the current value for return
  var ret = this.map_[key];
  // send the event
  var event = new rdm.ValueChangedEvent(this, key, value, this.map_[key] === undefined ? null : this.map_[key]);
  this.emitEventsAndChanged_([event]);
  return ret;
};


/**
 * @expose
 */
rdm.CollaborativeMap.prototype.values = function() {
  return Object.keys(this.map_).map(function(key) { return this.map_[key]; });
};


rdm.CollaborativeMap.prototype.executeEvent_ = function(event) {
  if(event.type == rdm.EventType.VALUE_CHANGED) {
    this.map_[event.property] = event.newValue;
    if(this.map_[event.property] === null) {
      delete this.map_[event.property];
    }
    // stop propagating changes if we're writing over a model object
    if(event.oldValue instanceof rdm.CollaborativeObject) {
      if(!goog.object.contains(this.map_, event.oldValue)) {
        event.oldValue.removeParentEventTarget(this);
      }
    }
    // propagate changes on model data objects
    if(event.newValue instanceof rdm.CollaborativeObject) {
      event.newValue.addParentEventTarget(this);
    }
  }
};

rdm.CollaborativeMap.prototype.toString = function() {
  var valList = [];
  for(var key in this.map_) {
    var valString;
    if(this.map_[key] instanceof rdm.CollaborativeObject) {
      valString = this.map_[key].toString();
    } else {
      valString = '[JsonValue ' + JSON.stringify(this.map_[key]) + ']';
    }
    valList.push(key + ': ' + valString);
  }
  return '{' + valList.join(', ') + '}';
};
