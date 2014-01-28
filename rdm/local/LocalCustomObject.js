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

goog.provide('rdm.local.LocalCustomObject');
goog.require('rdm.local.LocalModelObject');
goog.require('rdm.local.LocalObjectChangedEvent');
goog.require('rdm.local.LocalValueChangedEvent');

rdm.local.LocalCustomObject = function() {
	rdm.local.LocalModelObject.call(this);

  /**
   * Stores the actual values of the custom object fields
   * @private
   */
	this.backingFields_ = {};
};
goog.inherits(rdm.local.LocalCustomObject, rdm.local.LocalModelObject);

rdm.local.LocalCustomObject.prototype.executeEvent_ = function(event) {
  if(event instanceof rdm.local.LocalValueChangedEvent) {
    // set backing value
    this.backingFields_[event.property] = event.newValue;
    // update parents
    // TODO implement this in custom object subclass
    var children = this.getChildren_();
    if(event.oldValue instanceof rdm.local.LocalModelObject && !goog.contains(children, event.oldValue)) {
      event.oldValue.removeParentEventTarget(this);
    }
    if(event.newValue instanceof rdm.local.LocalModelObject) {
      event.newValue.addParentEventTarget(this);
    }
  }
};

rdm.local.LocalCustomObject.prototype.getChildren_ = function() {
  var values = [];
  for(var prop in this.backingFields_) {
    values.push(this.backingFields_[prop]);
  }
  return values;
};
