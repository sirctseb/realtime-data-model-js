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
goog.require('goog.array');
goog.require('rdm.CollaborativeObject');
goog.require('rdm.EventType');
goog.require('rdm.IndexReferenceContainer');
goog.require('rdm.ValuesAddedEvent');
goog.require('rdm.ValuesRemovedEvent');
goog.require('rdm.ValuesSetEvent');

// TODO document as extending CollaborativeObject instead of
// IndexReferenceContainer?
/**
 * A collaborative list. A list can contain other Realtime collaborative
 * object, custom collaborative objects, JavaScript primitive values, or
 * JavaScript objects that can be serialized to JSON.
 *
 * <p>Changes to the list will automatically be synced with the server and
 * other collaborators. To listen for changes, add EventListeners for the
 * following event types:</p>
 *
 * <ul>
 * <li> rdm.EventType.VALUES_ADDED
 * <li> rdm.EventType.VALUES_REMOVED
 * <li> rdm.EventType.VALUES_SET
 * </ul>
 *
 * <p>This class should not be instantiated directly. To create a new list, use
 * rdm.Model.prototype.createList().</p>
 *
 * @constructor
 * @extends {rdm.IndexReferenceContainer}
 * @param {rdm.Model} model The document model.
 * @param {Array.<*>} initialValue The initial contents of the list.
 */
rdm.CollaborativeList = function(model, initialValue) {
  rdm.IndexReferenceContainer.call(this, model);
  this.list_ = initialValue || [];
  var this_ = this;
  this.list_.map(function(element) { this_.propagateChanges_(element); });
  Object.defineProperties(this, {
    /**
     * The number of entries in the list. Assign to this field to reduce the
     * size of the list. Note that the length given must be < or equal to the
     * current size. The length of a list cannot be extended in this way.
     *
     * @type number
     * @instance
     * @memberOf rdm.CollaborativeList
     */
   'length': {
      get: function() {
        rdm.Document.verifyDocument_(this);
        return this.list_.length;
      },
      set: function(l) {
        rdm.Document.verifyDocument_(this);
        if (l < this.list_.length) {
          this.removeRange(l, this.list_.length);
        } else {
          throw new Error('Cannot set the list length to be greater than the' +
              ' current value.');
        }
      }
    }
  });
};
goog.inherits(rdm.CollaborativeList, rdm.IndexReferenceContainer);


/**
 * Returns a copy of the contents of this collaborative list as a Javascript
 * array. Changes to the returned object will not affect the original
 * collaborative list.
 * @return {Array.<*>} A copy of the contents of this collaborative list.
 */
rdm.CollaborativeList.prototype.asArray = function() {
  rdm.Document.verifyDocument_(this);
  return goog.array.clone(this.list_);
};

/**
 * Removes all the values the list.
 */
rdm.CollaborativeList.prototype.clear = function() {
  rdm.Document.verifyDocument_(this);
  if (this.list_.length == 0) return;
  // add event to stream
  var event = new rdm.ValuesRemovedEvent(this, 0, goog.array.clone(this.list_));
  this.emitEventsAndChanged_([event]);
};

/**
 * Inserts an item into the list at a given index.
 * @param {number} index The index at which to insert.
 * @param {*} value The value to insert.
 */
rdm.CollaborativeList.prototype.insert = function(index, value) {
  rdm.Document.verifyDocument_(this);
  // add event to stream
  var event = new rdm.ValuesAddedEvent(this, index, [value]);
  this.emitEventsAndChanged_([event]);
};

/**
 * Inserts a list of items into the list at a given index.
 * @param {number} index The index at which to insert.
 * @param {Array.<*>} values The values to insert.
 */
rdm.CollaborativeList.prototype.insertAll = function(index, values) {
  rdm.Document.verifyDocument_(this);
  // add event to stream
  var event = new rdm.ValuesAddedEvent(this, index, values);
  this.emitEventsAndChanged_([event]);
};

/**
 * Returns the last index of the given value, or -1 if it cannot be found.
 * @param {*} value The value to find.
 * @param {function(*,*): boolean} opt_comparatorFn Optional comparator function
 * used to determine the equality of two items.
 * @return {number} The index of the given value, or -1 if it cannot be found.
 */
rdm.CollaborativeList.prototype.lastIndexOf = function(
    value, opt_comparatorFn) {
  rdm.Document.verifyDocument_(this);
  if (opt_comparatorFn) {
    for (var i = this.list_.length - 1; i >= 0; i--) {
      if (opt_comparatorFn(this.list_[i], value)) {
        return i;
      }
    }
  } else {
    return this.list_.lastIndexOf(value);
  }
  return -1;
};

/**
 * Gets the value at the given index.
 * @param {number} index The index.
 * @return {*} The value at the given index.
 */
rdm.CollaborativeList.prototype.get = function(index) {
  rdm.Document.verifyDocument_(this);
  return this.list_[index];
};

/**
 * Returns the first index of the given value, or -1 if it cannot be found.
 * @param {*} value The value to find.
 * @param {function(*,*): boolean} opt_comparatorFn Optional comparator function
 * used to determine the equality of two items.
 * @return {number} The index of the given value, or -1 if it cannot be found.
 */
rdm.CollaborativeList.prototype.indexOf = function(value, opt_comparatorFn) {
  rdm.Document.verifyDocument_(this);
  if (opt_comparatorFn) {
    for (var i = 0; i < this.list_.length; i++) {
      if (opt_comparatorFn(this.list_[i], value)) {
        return i;
      }
    }
  } else {
    return this.list_.indexOf(value);
  }
  return -1;
};

// TODO this matches Google's docs. Should add period in description and
// probably should not say "insert"
/**
 * Sets the item at the given index
 * @param {number} index The index to insert at.
 * @param {*} value The value to set.
 */
rdm.CollaborativeList.prototype.set = function(index, value) {
  rdm.Document.verifyDocument_(this);
  if (index < 0 || index >= this.length) {
    // TODO rt throws an object with a string of this form in property 'n'
    throw 'Index: ' + index + ', Size: ' + this.length;
  }
  var event = new rdm.ValuesSetEvent(this, index, [this.list_[index]], [value]);
  this.emitEventsAndChanged_([event]);
};

/**
 * Adds an item to the end of the list.
 * @param {*} value The value to add.
 * @return {number} The new array length.
 */
rdm.CollaborativeList.prototype.push = function(value) {
  rdm.Document.verifyDocument_(this);
  var event = new rdm.ValuesAddedEvent(this, this.list_.length, [value]);
  this.emitEventsAndChanged_([event]);
  return this.list_.length;
};

/**
 * Adds an array of values to the end of the list.
 * @param {Array.<*>} values The values to add.
 */
rdm.CollaborativeList.prototype.pushAll = function(values) {
  rdm.Document.verifyDocument_(this);
  var event =
    new rdm.ValuesAddedEvent(this, this.list_.length, goog.array.clone(values));
  this.emitEventsAndChanged_([event]);
};

/**
 * Removes the item at the given index from the list.
 * @param {number} index The index of the item to remove.
 */
rdm.CollaborativeList.prototype.remove = function(index) {
  rdm.Document.verifyDocument_(this);
  var event = new rdm.ValuesRemovedEvent(this, index, [this.list_[index]]);
  this.emitEventsAndChanged_([event]);
};

/**
 * Removes the item at the given index from the list.
 * @param {number} startIndex The start index of the range to remove
 * (inclusive).
 * @param {number} endIndex The end index of the range to remove (exclusive).
 */
rdm.CollaborativeList.prototype.removeRange = function(startIndex, endIndex) {
  rdm.Document.verifyDocument_(this);
  var event = new rdm.ValuesRemovedEvent(
    this, startIndex, this.list_.slice(startIndex, endIndex));
  this.emitEventsAndChanged_([event]);
};

/**
 * Removes the first instance of the given value from the list.
 * @param {*} value The value to remove.
 * @return {boolean} Whether the item was removed.
 */
rdm.CollaborativeList.prototype.removeValue = function(value) {
  rdm.Document.verifyDocument_(this);
  // get index of value for event
  var index = this.list_.indexOf(value);
  if (index != -1) {
    // add to stream
    var event = new rdm.ValuesRemovedEvent(this, index, [value]);
    this.emitEventsAndChanged_([event]);
    return true;
  }
  return false;
};

/**
 * Replaces the items in the list with the given items, starting at the given
 * index.
 * @param {number} index The index to set at.
 * @param {Array.<*>} values The values to insert.
 */
rdm.CollaborativeList.prototype.replaceRange = function(index, values) {
  rdm.Document.verifyDocument_(this);

  // match rt error when values is longer than available space
  if (index + values.length >= this.length) {
    throw 'Index: ' + this.length + ', Size: ' + this.length;
  }

  var event = new rdm.ValuesSetEvent(
    this, index, this.list_.slice(index, index + values.length), values);
  this.emitEventsAndChanged_([event]);
};

/**
 * Add this as an event target parent to the given element.
 * @param {*} element The element which will have this as an event target
 * parent.
 * @private
 */
rdm.CollaborativeList.prototype.propagateChanges_ = function(element) {
  rdm.Document.verifyDocument_(this);
  if (element instanceof rdm.CollaborativeObject) {
    element.addParentEventTarget(this);
  }
};

/**
 * Remove this as an event target parnet of the given element if no instances
 * remain in the list.
 * @param {*} element The element which will no longer have this as an event
 * target parent.
 * @private
 */
rdm.CollaborativeList.prototype.stopPropagatingChanges_ = function(element) {
  rdm.Document.verifyDocument_(this);
  if (element instanceof rdm.CollaborativeObject &&
        this.list_.indexOf(element) == -1) {
    element.removeParentEventTarget(this);
  }
};

/**
 * Make the modifications to the list described by the given event.
 * @param {rdm.BaseModelEvent} event The event whose modifications should be
 * applied to the list.
 * @private
 */
rdm.CollaborativeList.prototype.executeEvent_ = function(event) {
  rdm.Document.verifyDocument_(this);
  if (event.type == rdm.EventType.VALUES_SET) {
    // TODO parameterize on index and combine with VALUES_ADDED
    // clone new values
    var this_ = this;
    var newValues = event.newValues.map(function(value) { return this_.cloneNativeObject_(value); });
    Array.prototype.splice.apply(this.list_,
      [event.index, event.newValues.length].concat(newValues));
    // update event parents
    for (var i = 0; i < event.oldValues.length; i++) {
      this.stopPropagatingChanges_(event.oldValues[i]);
    }
    for (var i = 0; i < event.newValues.length; i++) {
      this.propagateChanges_(event.newValues[i]);
    }
  } else if (event.type == rdm.EventType.VALUES_REMOVED) {
    // update list
    this.list_.splice(event.index, event.values.length);
    // update event parents
    for (var i = 0; i < event.values.length; i++) {
      this.stopPropagatingChanges_(event.values[i]);
    }
    // update references
    this.shiftReferencesOnDelete_(event.index, event.values.length);
  } else if (event.type == rdm.EventType.VALUES_ADDED) {
    // clone new values
    var this_ = this;
    var values = event.values.map(function(value) { return this_.cloneNativeObject_(value); });
    // update list
    Array.prototype.splice.apply(
      this.list_, [event.index, 0].concat(values));
    // update event parents
    for (var i = 0; i < event.values.length; i++) {
      this.propagateChanges_(event.values[i]);
    }
    // update references
    this.shiftReferencesOnInsert_(event.index, event.values.length);
  }
};

/**
 * Returns a string representation of this collaborative object.
 * @return {string} A string representation.
 */
rdm.CollaborativeList.prototype.toString = function() {
  rdm.Document.verifyDocument_(this);

  return this.toStringHelper_({});
};

/**
 * Returns a string representation of this collaborative object.
 *
 * @param {Object} ids A map whose keys are the collaborative object ids
 * that have alredy been added to the exported object.
 *
 * @return {string} A string representation.
 */
rdm.CollaborativeList.prototype.toStringHelper_ = function(ids) {
  rdm.Document.verifyDocument_(this);

  // check if our id is already in the map
  if(ids[this.id]) {
    return '<List: ' + this.id + '>';
  }

  // add id to map
  ids[this.id] = true;

  var renderedList = this.list_.map(function(element) {
    if (element instanceof rdm.CollaborativeObject) {
      return element.toStringHelper_(ids);
    } else if(rdm.custom.isCustomObject(element)) {
      return element.toStringHelper_(ids);
    } else {
      return '[JsonValue ' + JSON.stringify(element) + ']';
    }
  });
  return '[' + renderedList.join(', ') + ']';
};

/**
 * Returns a js representation of this collaborative list for export.
 *
 * @param {Object} ids A map whose keys are the collaborative object ids
 * that have already been added to the exported object.
 *
 * @return {Object} A js representation of this collaborative list.
 * @private
 */
rdm.CollaborativeList.prototype.export = function(ids) {
  rdm.Document.verifyDocument_(this);

  // check if this object has already been added,
  // and return a ref if so
  if(ids[this.id]) {
    return {'ref': this.id};
  }

  // TODO need to make root map's id "root"
  // initialize result map
  var result = {
    'id': this.id,
    'type': 'List',
    'value': []
  };

  // add id to map
  ids[this.id] = true;

  // add values
  var values = this.asArray();
  for(var i = 0; i < values.length; i++) {
    if(values[i] instanceof rdm.CollaborativeObject) {
      // if value is a collaborative object, call export
      result['value'].push(values[i].export(ids));
    } else {
      // otherwise set json value
      result['value'].push({'json': values[i]});
    }
  }

  return result;
};
