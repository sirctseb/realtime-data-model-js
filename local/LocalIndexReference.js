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

// TODO realtime api shows model as param to constructor
rdm.local.LocalIndexReference = function(index, canBeDeleted, referencedObject) {
  rdm.local.LocalModelObject.call(this);
  this.index = index;
  this.canBeDeleted = canBeDeleted;
  this.referencedObject = referencedObject;

  // Stream<LocalReferenceShiftedEvent> get onReferenceShifted => _onReferenceShifted.stream;

  // update index and send event for a shift
};
goog.inherits(rdm.local.LocalIndexReference, rdm.local.LocalModelObject);

rdm.local.LocalIndexReference.prototype.shift_ = function(int newIndex) {
  var oldIndex = this.index;
  this.index = newIndex;
  // _onReferenceShifted.add(new LocalReferenceShiftedEvent._(index, oldIndex, referencedObject));
};
