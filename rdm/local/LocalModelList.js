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

goog.provide('rdm.local.LocalModelList');
goog.require('rdm.local.LocalIndexReferenceContainer');
goog.require('rdm.local.LocalValuesAddedEvent');
goog.require('rdm.local.LocalValuesRemovedEvent');
goog.require('rdm.local.LocalValuesSetEvent');
goog.require('rdm.local.LocalModelObject');
goog.require('rdm.EventType');
goog.require('goog.array');

rdm.local.LocalModelList = function(initialValue) {
  rdm.local.LocalIndexReferenceContainer.call(this);
  this.list_ = initialValue || [];
  this.list_.map(function(element) { propogateChanges_(element); });
  // TODO add tests for length property
  Object.defineProperty(this, 'length', {
    get: function() { return this.list_.length; },
    set: function(l) {
      if(l < this.list_.length) {
        this.removeRange(l, this.list_.length);
      }
    }
  });
};
goog.inherits(rdm.local.LocalModelList, rdm.local.LocalIndexReferenceContainer);


/**
 * @expose
 */
rdm.local.LocalModelList.prototype.asArray = function() {
  return goog.array.clone(this.list_);
};

/**
 * @expose
 */
rdm.local.LocalModelList.prototype.clear = function() {
  if(this.list_.length == 0) return;
  // add event to stream
  var event = new rdm.local.LocalValuesRemovedEvent(this, 0, goog.array.clone(this.list_));
  // TODO take old stream controller parameter out of these calls
  this.emitEventsAndChanged_([event]);
};

/**
 * @expose
 */
rdm.local.LocalModelList.prototype.insert = function(index, value) {
  // add event to stream
  var event = new rdm.local.LocalValuesAddedEvent(this, index, [value]);
  this.emitEventsAndChanged_([event]);
};

/**
 * @expose
 */
rdm.local.LocalModelList.prototype.insertAll = function(index, values) {
  // add event to stream
  // TODO clone values?
  var event = new rdm.local.LocalValuesAddedEvent(this, index, values);
  this.emitEventsAndChanged_([event]);
};

/**
 * @expose
 */
rdm.local.LocalModelList.prototype.lastIndexOf = function(value, opt_comparatorFn) {
  if(opt_comparatorFn) {
    for(var i = this.list_.length - 1; i >= 0; i--) {
      if(opt_comparatorFn(this.list_[i], value)) {
        return i;
      }
    }
  } else {
    return this.list_.lastIndexOf(value);
  }
  return -1;
};

/**
 * @expose
 */
rdm.local.LocalModelList.prototype.get = function(index) {
  return this.list_[index];
}

/**
 * @expose
 */
rdm.local.LocalModelList.prototype.indexOf = function(value, opt_comparatorFn) {
  if(opt_comparatorRn) {
    for(var i = 0; i < this.list_.length; i++) {
      if(opt_comparatorFn(this.list_[i], value)) {
        return i;
      }
    }
  } else {
    return this.list_.indexOf(value);
  }
  return -1;
};

/**
 * @expose
 */
rdm.local.LocalModelList.prototype.set = function(index, value) {
  // TODO js errors?
  // if (index < 0 || index >= length) throw new RangeError.value(index);
  var event = new rdm.local.LocalValuesSetEvent(this, index, [value], [this.list_[index]]);
  this.emitEventsAndChanged_([event]);
}

/**
 * @expose
 */
rdm.local.LocalModelList.prototype.push = function(value) {
  // TODO make sure this is the index provided when inserting at the end
  var event = new rdm.local.LocalValuesAddedEvent(this, this.list_.length, [value]);
  this.emitEventsAndChanged_([event]);
  return this.list_.length;
}

/**
 * @expose
 */
rdm.local.LocalModelList.prototype.pushAll = function(values) {
  // TODO make sure this is the index provided when inserting at the end
  var event = new rdm.local.LocalValuesAddedEvent(this, this.list_.length, goog.array.clone(values));
  this.emitEventsAndChanged_([event]);
}

/**
 * @expose
 */
rdm.local.LocalModelList.prototype.remove = function(index) {
  var event = new rdm.local.LocalValuesRemovedEvent(this, index, [this.list_[index]]);
  this.emitEventsAndChanged_([event]);
}

/**
 * @expose
 */
rdm.local.LocalModelList.prototype.removeRange = function(startIndex, endIndex) {
  // add event to stream
  var event = new rdm.local.LocalValuesRemovedEvent(this, startIndex, this.list_.slice(startIndex, endIndex));
  this.emitEventsAndChanged_([event]);
}

/**
 * @expose
 */
rdm.local.LocalModelList.prototype.removeValue = function(value) {
  // get index of value for event
  var index = this.list_.indexOf(value);
  if(index != -1) {
    // add to stream
    var event = new rdm.local.LocalValuesRemovedEvent(this, index, [value]);
    this.emitEventsAndChanged_([event]);
    return true;
  }
  return false;
}

/**
 * @expose
 */
rdm.local.LocalModelList.prototype.replaceRange = function(index, values) {
  // add event to stream
  // TODO clone values?
  var event = new rdm.local.LocalValuesSetEvent(this, index, values, this.list_.slice(index, index + values.length));
  this.emitEventsAndChanged_([event]);
}

// check if value is a model object and set this as parent
rdm.local.LocalModelList.prototype.propagateChanges_ = function(element) {
  if(element instanceof rdm.local.LocalModelObject) {
    element.addParentEventTarget(this);
  }
}

// check if value is a model object and remove self as parent
rdm.local.LocalModelList.prototype.stopPropagatingChanges_ = function(element) {
  // stop propagation if overwritten element is model object and it is no longer anywhere in the list
  // TODO this depends on this method being called _after_ the element is removed from this.list_
  if(element instanceof rdm.local.LocalModelObject && this.list_.indexOf(element) == -1) {
    element.removeParentEventTarget(this);
  }
}

rdm.local.LocalModelList.prototype.executeEvent_ = function(event) {
  if(event.type == rdm.EventType.VALUES_SET) {
      Array.prototype.splice.apply(this.list_, [event.index, event.newValues.length].concat(event.newValues));
      // update event parents
      for(var i = 0; i < event.oldValues.length; i++) {
        this.stopPropagatingChanges_(event.oldValues[i]);
      }
      for(var i = 0; i < event.newValues.length; i++) {
        this.propagateChanges_(event.newValues[i]);
      }
  } else if(event.type == rdm.EventType.VALUES_REMOVED) {
      // update list
      this.list_.splice(event.index, event.values.length);
      // update event parents
      for(var i = 0; i < event.values.length; i++) {
        this.stopPropagatingChanges_(event.values[i]);
      }
      // update references
      this.shiftReferencesOnDelete_(event.index, event.values.length);
  } else if(event.type == rdm.EventType.VALUES_ADDED) {
      // update list
      Array.prototype.splice.apply(this.list_, [event.index, 0].concat(event.values));
      // update event parents
      for(var i = 0; i < event.values.length; i++) {
        this.propagateChanges_(event.values[i]);
      }
      // update references
      this.shiftReferencesOnInsert_(event.index, event.values.length);
  }
}
