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

goog.provide('rdm.local.LocalIndexReference');
goog.require('rdm.local.LocalModelObject');
goog.require('rdm.local.LocalReferenceShiftedEvent');

// TODO(cjb) realtime api shows model as param to constructor but I don't see why we would need it
rdm.local.LocalIndexReference = function(index, canBeDeleted, referencedObject) {
  rdm.local.LocalModelObject.call(this);
  this.index = index;
  // TODO make these getters?
  this.canBeDeleted = canBeDeleted;
  this.referencedObject = referencedObject;
};
goog.inherits(rdm.local.LocalIndexReference, rdm.local.LocalModelObject);

rdm.local.LocalIndexReference.prototype.shift_ = function(newIndex) {
  var oldIndex = this.index;
  this.index = newIndex;
  this.dispatchEvent(new rdm.local.LocalReferenceShiftedEvent(this, this.index, oldIndex));
};