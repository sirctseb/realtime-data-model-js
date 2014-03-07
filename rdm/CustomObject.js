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

goog.provide('rdm.CustomObject');
goog.require('rdm.CollaborativeObjectBase');
goog.require('rdm.ObjectChangedEvent');
goog.require('rdm.ValueChangedEvent');

rdm.CustomObject = function(model) {
	rdm.CollaborativeObjectBase.call(this, model);

  /**
   * Stores the actual values of the custom object fields
   * @private
   */
	this.backingFields_ = {};
};
goog.inherits(rdm.CustomObject, rdm.CollaborativeObjectBase);

rdm.CustomObject.instances_ = [];

/**
 * Maps from names to {type, initializerFn, onLoadedFn, fields} as registered by
 * rdm.LocalDocumentProvider.registerType, rdm.LocalDocumentProvider.setInitializer, and
 * rdm.LocalDocumentProvider.setOnLoaded
 * @private
 */
rdm.CustomObject.customTypes_ = {};

/**
 * Given a registered custom object type, find the registered name
 * @private
 */
rdm.CustomObject.customTypeName_ = function(ref) {
  for(var name in rdm.CustomObject.customTypes_) {
    if(rdm.CustomObject.customTypes_[name].type === ref) {
      return name;
    }
  }
  throw ref + ' is not a registered custom object type';
};

rdm.CustomObject.prototype.executeEvent_ = function(event) {
  if(event instanceof rdm.ValueChangedEvent) {
    // set backing value
    this.backingFields_[event.property] = event.newValue;
    // update parents
    var children = this.getChildren_();
    if(event.oldValue instanceof rdm.CollaborativeObject && !goog.contains(children, event.oldValue)) {
      event.oldValue.removeParentEventTarget(this);
    }
    if(event.newValue instanceof rdm.CollaborativeObject) {
      event.newValue.addParentEventTarget(this);
    }
  }
};

rdm.CustomObject.prototype.getChildren_ = function() {
  var values = [];
  for(var prop in this.backingFields_) {
    values.push(this.backingFields_[prop]);
  }
  return values;
};