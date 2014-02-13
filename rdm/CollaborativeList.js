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

goog.provide('rdm.CollaborativeList');
goog.require('rdm.IndexReferenceContainer');
goog.require('rdm.ValuesAddedEvent');
goog.require('rdm.ValuesRemovedEvent');
goog.require('rdm.ValuesSetEvent');
goog.require('rdm.CollaborativeObject');
goog.require('rdm.EventType');
goog.require('goog.array');

rdm.CollaborativeList = function(model, initialValue) {
  rdm.IndexReferenceContainer.call(this, model);
  this.list_ = initialValue || [];
  var this_ = this;
  this.list_.map(function(element) { this_.propagateChanges_(element); });
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
goog.inherits(rdm.CollaborativeList, rdm.IndexReferenceContainer);


/**
 * @expose
 */
rdm.CollaborativeList.prototype.asArray = function() {
  return goog.array.clone(this.list_);
};

/**
 * @expose
 */
rdm.CollaborativeList.prototype.clear = function() {
  if(this.list_.length == 0) return;
  // add event to stream
  var event = new rdm.ValuesRemovedEvent(this, 0, goog.array.clone(this.list_));
  this.emitEventsAndChanged_([event]);
};

/**
 * @expose
 */
rdm.CollaborativeList.prototype.insert = function(index, value) {
  // add event to stream
  var event = new rdm.ValuesAddedEvent(this, index, [value]);
  this.emitEventsAndChanged_([event]);
};

/**
 * @expose
 */
rdm.CollaborativeList.prototype.insertAll = function(index, values) {
  // add event to stream
  var event = new rdm.ValuesAddedEvent(this, index, values);
  this.emitEventsAndChanged_([event]);
};

/**
 * @expose
 */
rdm.CollaborativeList.prototype.lastIndexOf = function(value, opt_comparatorFn) {
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
rdm.CollaborativeList.prototype.get = function(index) {
  return this.list_[index];
}

/**
 * @expose
 */
rdm.CollaborativeList.prototype.indexOf = function(value, opt_comparatorFn) {
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
rdm.CollaborativeList.prototype.set = function(index, value) {
  if(index < 0 || index >= length) {
    // TODO rt throws an object with a string of this form in property 'n'
    throw 'Index: ' + index + ', Size: ' + this.length;
  }
  var event = new rdm.ValuesSetEvent(this, index, [value], [this.list_[index]]);
  this.emitEventsAndChanged_([event]);
}

/**
 * @expose
 */
rdm.CollaborativeList.prototype.push = function(value) {
  var event = new rdm.ValuesAddedEvent(this, this.list_.length, [value]);
  this.emitEventsAndChanged_([event]);
  return this.list_.length;
}

/**
 * @expose
 */
rdm.CollaborativeList.prototype.pushAll = function(values) {
  var event = new rdm.ValuesAddedEvent(this, this.list_.length, goog.array.clone(values));
  this.emitEventsAndChanged_([event]);
}

/**
 * @expose
 */
rdm.CollaborativeList.prototype.remove = function(index) {
  var event = new rdm.ValuesRemovedEvent(this, index, [this.list_[index]]);
  this.emitEventsAndChanged_([event]);
}

/**
 * @expose
 */
rdm.CollaborativeList.prototype.removeRange = function(startIndex, endIndex) {
  // add event to stream
  var event = new rdm.ValuesRemovedEvent(this, startIndex, this.list_.slice(startIndex, endIndex));
  this.emitEventsAndChanged_([event]);
}

/**
 * @expose
 */
rdm.CollaborativeList.prototype.removeValue = function(value) {
  // get index of value for event
  var index = this.list_.indexOf(value);
  if(index != -1) {
    // add to stream
    var event = new rdm.ValuesRemovedEvent(this, index, [value]);
    this.emitEventsAndChanged_([event]);
    return true;
  }
  return false;
}

/**
 * @expose
 */
rdm.CollaborativeList.prototype.replaceRange = function(index, values) {
  // add event to stream
  var event = new rdm.ValuesSetEvent(this, index, values, this.list_.slice(index, index + values.length));
  this.emitEventsAndChanged_([event]);
}

// check if value is a model object and set this as parent
rdm.CollaborativeList.prototype.propagateChanges_ = function(element) {
  if(element instanceof rdm.CollaborativeObject) {
    element.addParentEventTarget(this);
  }
}

// check if value is a model object and remove self as parent
rdm.CollaborativeList.prototype.stopPropagatingChanges_ = function(element) {
  // stop propagation if overwritten element is model object and it is no longer anywhere in the list
  if(element instanceof rdm.CollaborativeObject && this.list_.indexOf(element) == -1) {
    element.removeParentEventTarget(this);
  }
}

rdm.CollaborativeList.prototype.executeEvent_ = function(event) {
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

rdm.CollaborativeList.prototype.toString = function() {
  var renderedList = this.list_.map(function(element) {
    if(element instanceof rdm.CollaborativeObject) {
      return element.toString();
    } else {
      return '[JsonValue ' + JSON.stringify(element) + ']';
    }
  });
  return '[' + renderedList.join(', ') + ']';
};
