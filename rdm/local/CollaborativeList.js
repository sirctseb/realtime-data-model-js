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

goog.provide('rdm.local.CollaborativeList');
goog.require('rdm.local.IndexReferenceContainer');
goog.require('rdm.local.ValuesAddedEvent');
goog.require('rdm.local.ValuesRemovedEvent');
goog.require('rdm.local.ValuesSetEvent');
goog.require('rdm.local.CollaborativeObject');
goog.require('rdm.EventType');
goog.require('goog.array');

rdm.local.CollaborativeList = function(model, initialValue) {
  rdm.local.IndexReferenceContainer.call(this, model);
  this.list_ = initialValue || [];
  this.list_.map(function(element) { propogateChanges_(element); });
  Object.defineProperty(this, 'length', {
    get: function() { return this.list_.length; },
    set: function(l) {
      if(l < this.list_.length) {
        this.removeRange(l, this.list_.length);
      } else {
        throw new Error('Cannot set the list length to be greater than the current value.');
      }
    }
  });
};
goog.inherits(rdm.local.CollaborativeList, rdm.local.IndexReferenceContainer);


/**
 * @expose
 */
rdm.local.CollaborativeList.prototype.asArray = function() {
  return goog.array.clone(this.list_);
};

/**
 * @expose
 */
rdm.local.CollaborativeList.prototype.clear = function() {
  if(this.list_.length == 0) return;
  // add event to stream
  var event = new rdm.local.ValuesRemovedEvent(this, 0, goog.array.clone(this.list_));
  this.emitEventsAndChanged_([event]);
};

/**
 * @expose
 */
rdm.local.CollaborativeList.prototype.insert = function(index, value) {
  // add event to stream
  var event = new rdm.local.ValuesAddedEvent(this, index, [value]);
  this.emitEventsAndChanged_([event]);
};

/**
 * @expose
 */
rdm.local.CollaborativeList.prototype.insertAll = function(index, values) {
  // add event to stream
  var event = new rdm.local.ValuesAddedEvent(this, index, values);
  this.emitEventsAndChanged_([event]);
};

/**
 * @expose
 */
rdm.local.CollaborativeList.prototype.lastIndexOf = function(value, opt_comparatorFn) {
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
rdm.local.CollaborativeList.prototype.get = function(index) {
  return this.list_[index];
}

/**
 * @expose
 */
rdm.local.CollaborativeList.prototype.indexOf = function(value, opt_comparatorFn) {
  if(opt_comparatorFn) {
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
rdm.local.CollaborativeList.prototype.set = function(index, value) {
  if(index < 0 || index >= length) {
    // TODO rt throws an object with a string of this form in property 'n'
    throw 'Index: ' + index + ', Size: ' + this.length;
  }
  var event = new rdm.local.ValuesSetEvent(this, index, [value], [this.list_[index]]);
  this.emitEventsAndChanged_([event]);
}

/**
 * @expose
 */
rdm.local.CollaborativeList.prototype.push = function(value) {
  var event = new rdm.local.ValuesAddedEvent(this, this.list_.length, [value]);
  this.emitEventsAndChanged_([event]);
  return this.list_.length;
}

/**
 * @expose
 */
rdm.local.CollaborativeList.prototype.pushAll = function(values) {
  var event = new rdm.local.ValuesAddedEvent(this, this.list_.length, goog.array.clone(values));
  this.emitEventsAndChanged_([event]);
}

/**
 * @expose
 */
rdm.local.CollaborativeList.prototype.remove = function(index) {
  var event = new rdm.local.ValuesRemovedEvent(this, index, [this.list_[index]]);
  this.emitEventsAndChanged_([event]);
}

/**
 * @expose
 */
rdm.local.CollaborativeList.prototype.removeRange = function(startIndex, endIndex) {
  // add event to stream
  var event = new rdm.local.ValuesRemovedEvent(this, startIndex, this.list_.slice(startIndex, endIndex));
  this.emitEventsAndChanged_([event]);
}

/**
 * @expose
 */
rdm.local.CollaborativeList.prototype.removeValue = function(value) {
  // get index of value for event
  var index = this.list_.indexOf(value);
  if(index != -1) {
    // add to stream
    var event = new rdm.local.ValuesRemovedEvent(this, index, [value]);
    this.emitEventsAndChanged_([event]);
    return true;
  }
  return false;
}

/**
 * @expose
 */
rdm.local.CollaborativeList.prototype.replaceRange = function(index, values) {
  // add event to stream
  var event = new rdm.local.ValuesSetEvent(this, index, values, this.list_.slice(index, index + values.length));
  this.emitEventsAndChanged_([event]);
}

// check if value is a model object and set this as parent
rdm.local.CollaborativeList.prototype.propagateChanges_ = function(element) {
  if(element instanceof rdm.local.CollaborativeObject) {
    element.addParentEventTarget(this);
  }
}

// check if value is a model object and remove self as parent
rdm.local.CollaborativeList.prototype.stopPropagatingChanges_ = function(element) {
  // stop propagation if overwritten element is model object and it is no longer anywhere in the list
  if(element instanceof rdm.local.CollaborativeObject && this.list_.indexOf(element) == -1) {
    element.removeParentEventTarget(this);
  }
}

rdm.local.CollaborativeList.prototype.executeEvent_ = function(event) {
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
