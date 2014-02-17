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

goog.provide('rdm.IndexReference');
goog.require('rdm.CollaborativeObject');
goog.require('rdm.ReferenceShiftedEvent');

/**
 * An IndexReference is a pointer to a specific location in a collaborative list
 * or string. This pointer automatically shifts as new elements are added to and
 * removed from the object.<br/>
 * To listen for changes to the referenced index, add an EventListener for
 * rdm.EventType.REFERENCE_SHIFTED.
 * <p>This class should not be instantiated directly. To create an index
 * reference, call registerReference on the appropriate string or list.
 *
 * @constructor
 * @extends rdm.CollaborativeObject
 * @param {rdm.Model} model The document model.
 * @param {number} index The initial value of the index.
 * @param {boolean} canBeDeleted Whether this reference can be deleted.
 * @param {rdm.CollaborativeObject} referencedObject The object this reference
 *     points to.
 */
rdm.IndexReference = function(model, index, canBeDeleted, referencedObject) {
  rdm.CollaborativeObject.call(this, model);
  /**
   * The index of the current location the reference points to. Write to this
   * property to change the referenced index.
   *
   * @type number
   */
  this.index = index;
  Object.defineProperties(this, {
    /**
     * Whether this reference can be deleted. Read-only.
     * This property affects the behavior of the index reference when the index
     * the reference points to is deleted. If this is true, the index reference
     * will be deleted. If it is false, the index reference will move to point
     * at the beginning of the deleted range.
     *
     * @type boolean
     * @instance
     * @memberOf rdm.IndexReference
     */
    'canBeDeleted': {get: function() {return canBeDeleted;}},
    /**
     * The object this reference points to. Read-only.
     *
     * @type rdm.CollaborativeObject
     * @instance
     * @memberOf rdm.IndexReference
     */
    'referencedObject': {get: function() {return referencedObject;}}
  });
};
goog.inherits(rdm.IndexReference, rdm.CollaborativeObject);

/**
 * Change the value of the index to be newIndex and fire a corresponding event.
 *
 * @private
 * @param {number} newIndex The new value of the index.
 */
rdm.IndexReference.prototype.shift_ = function(newIndex) {
  var oldIndex = this.index;
  this.index = newIndex;
  this.dispatchEvent(new rdm.ReferenceShiftedEvent(this, this.index, oldIndex));
};
