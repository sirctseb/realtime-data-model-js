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
  // map from object ids of contained elements to subscriptions to their object changed streams
  this.ssMap_ = {};
};
goog.inherits(rdm.local.LocalModelList, rdm.local.LocalIndexReferenceContainer);


rdm.local.LocalModelList.prototype.asArray = function() {
  return goog.array.clone(this.list_);
};

rdm.local.LocalModelList.prototype.clear = function() {
  if(this.list_.length == 0) return;
  // add event to stream
  var event = new rdm.local.LocalValuesRemovedEvent(this, 0, goog.array.clone(this.list_));
  // TODO take old stream controller parameter out of these calls
  this.emitEventsAndChanged_([event]);
};

rdm.local.LocalModelList.prototype.insert = function(index, value) {
  // add event to stream
  var event = new rdm.local.LocalValuesAddedEvent(this, index, [value]);
  this.emitEventsAndChanged_([event]);
};

rdm.local.LocalModelList.prototype.insertAll = function(index, values) {
  // add event to stream
  // TODO clone values?
  var event = new rdm.local.LocalValuesAddedEvent(this, index, values);
  this.emitEventsAndChanged_([event]);
};

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

rdm.local.LocalModelList.prototype.get = function(index) {
  return this.list_[index];
}

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

rdm.local.LocalModelList.prototype.set = function(index, value) {
  // TODO js errors?
  // if (index < 0 || index >= length) throw new RangeError.value(index);
  // add event to stream
  var event = new rdm.local.LocalValuesSetEvent(this, index, [value], [this.list_[index]]);
  this.emitEventsAndChanged_([event]);
}

// Stream<rt.ValuesAddedEvent> get onValuesAdded => _onValuesAdded.stream;
// Stream<rt.ValuesRemovedEvent> get onValuesRemoved => _onValuesRemoved.stream;
// Stream<rt.ValuesSetEvent> get onValuesSet => _onValuesSet.stream;

rdm.local.LocalModelList.prototype.push = function(value) {
  // add event to stream
  // TODO make sure this is the index provided when inserting at the end
  var event = new rdm.local.LocalValuesAddedEvent(this, this.list_.length, [value]);
  this.emitEventsAndChanged_([event]);
  return this.list_.length;
}

rdm.local.LocalModelList.prototype.pushAll = function(values) {
  // add event to stream
  // TODO make sure this is the index provided when inserting at the end
  var event = new rdm.local.LocalValuesAddedEvent(this, this.list_.length, goog.array.clone(values));
  this.emitEventsAndChanged_([event]);
}

rdm.local.LocalModelList.prototype.remove = function(index) {
  // add event to stream
  var event = new rdm.local.LocalValuesRemovedEvent(this, index, [this.list_[index]]);
  this.emitEventsAndChanged_([event]);
}

rdm.local.LocalModelList.prototype.removeRange = function(startIndex, endIndex) {
  // add event to stream
  var event = new rdm.local.LocalValuesRemovedEvent(this, startIndex, this.list_.slice(startIndex, endIndex));
  this.emitEventsAndChanged_([event]);
}

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

rdm.local.LocalModelList.prototype.replaceRange = function(index, values) {
  // add event to stream
  // TODO clone values?
  var event = new rdm.local.LocalValuesSetEvent(this, index, values, this.list_.slice(index, index + values.length));
  this.emitEventsAndChanged_([event]);
}

// check if value is a model object and start propagating object changed events
rdm.local.LocalModelList.prototype.propagateChanges_ = function(element) {
  // start propagating changes if element is model object and not already subscribed
  if(element instanceof rdm.local.LocalModelObject) {
    element.setParentEventTarget(null);
  }
}
// check if value is a model object and stop propagating object changed events
rdm.local.LocalModelList.prototype.stopPropagatingChanges_ = function(element) {
  // stop propagation if overwritten element is model object and it is no longer anywhere in the list
  // TODO this depends on this method being called _after_ the element is removed from this.list_
  if(element instanceof rdm.local.LocalModelObject && !this.list_.indexOf(element) != -1) {
    element.setParentEventTarget(null);
  }
}

// TODO we could alternatively listen for our own events and do the modifications there
rdm.local.LocalModelList.prototype.executeEvent_ = function(event) {
  if(event.type == rdm.local.LocalEventType.VALUES_SET) {
      Array.prototype.splice.apply(this.list_, [event.index, event.newValues.length].concat(event.newValues));
  } else if(event.type == rdm.local.LocalEventType.VALUES_REMOVED) {
      // update list
      this.list_.splice(event.index, event.values.length);
      // update references
      this.shiftReferencesOnDelete_(event.index, event.values.length);
  } else if(event.type == rdm.local.LocalEventType.VALUES_ADDED) {
      // update list
      Array.prototype.splice.apply(this.list_, [event.index, 0].concat(event.values));
      // update references
      this.shiftReferencesOnInsert_(event.index, event.values.length);
  }
}
