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

goog.provide('rdm.local.LocalIndexReferenceContainer');
goog.require('rdm.local.LocalModelObject');

// Implements index reference management
rdm.local.LocalIndexReferenceContainer = function() {
  rdm.local.LocalModelObject.call(this);
  this.indexReferences_ = [];
}
goog.inherits(rdm.local.LocalIndexReferenceContainer, rdm.local.LocalModelObject);

rdm.local.LocalIndexReferenceContainer.prototype.registerReference = function(index, canBeDeleted) {
  // create the reference
  var ref = new rdm.local.LocalIndexReference(index, canBeDeleted, this);
  // add to list of references
  this.indexReferences_.push(ref);
  return ref;
};


rdm.local.LocalIndexReferenceContainer.prototype.shiftReferencesOnDelete_ = function(index, length) {
  // check for reference shifts
  this.indexReferences_.map(function(ref) {
    // if index is to the right of deletion, shift by deleted length
    if(ref.index >= index + length) {
      ref.shift_(ref.index - length);
    } else if(ref.index >= index) {
      if(ref.canBeDeleted) {
        // if within deleted segment and can be deleted, set to -1
        ref.shift_(-1);
      } else {
        // otherwise set to index at beginning of deleted segment
        ref.shift_(index);
      }
    }
  });
};


rdm.local.LocalIndexReferenceContainer.prototype.shiftReferencesOnInsert_ = function(index, length) {
  // check for reference shifts
  this.indexReferences_.map(function(ref) {
    // if index is to the right on insert index, increase reference
    if(ref.index >= index) {
      ref.shift_(ref.index + length);
    }
  });
};
