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

goog.provide('rdm.local.LocalModelString');
goog.require('rdm.local.LocalIndexReferenceContainer');
goog.require('rdm.local.LocalTextInsertedEvent');
goog.require('rdm.local.LocalTextDeletedEvent');
goog.require('rdm.EventType');

rdm.local.LocalModelString = function(model, initialValue) {
  rdm.local.LocalIndexReferenceContainer.call(this, model);
  this.string_ = initialValue || "";
  Object.defineProperty(this, "length", {
    get: function() { return this.string_.length; }
  });
};
goog.inherits(rdm.local.LocalModelString, rdm.local.LocalIndexReferenceContainer);


/**
 * @expose
 */
rdm.local.LocalModelString.prototype.append = function(text) {
  var insertEvent = new rdm.local.LocalTextInsertedEvent(this, this.string_.length, text);
  this.emitEventsAndChanged_([insertEvent]);
};


/**
 * @expose
 */
rdm.local.LocalModelString.prototype.getText = function() {
  return this.string_;
};


/**
 * @expose
 */
rdm.local.LocalModelString.prototype.insertString = function(index, text) {
  var insertEvent = new rdm.local.LocalTextInsertedEvent(this, index, text);
  this.emitEventsAndChanged_([insertEvent]);
};


/**
 * @expose
 */
rdm.local.LocalModelString.prototype.removeRange = function(startIndex, endIndex) {
  // get removed text for event
  var removed = this.string_.slice(startIndex, endIndex);
  // add event to stream
  var deleteEvent = new rdm.local.LocalTextDeletedEvent(this, startIndex, removed);
  this.emitEventsAndChanged_([deleteEvent]);
};


/**
 * @expose
 */
rdm.local.LocalModelString.prototype.setText = function(text) {
  // TODO do real string diff
  // trivial edit decomposition algorithm
  var deleteEvent = new rdm.local.LocalTextDeletedEvent(this, 0, this.string_);
  var insertEvent = new rdm.local.LocalTextInsertedEvent(this, 0, text);
  this.emitEventsAndChanged_([deleteEvent, insertEvent]);
}


rdm.local.LocalModelString.prototype.executeEvent_ = function(event) {
  if(event.type == rdm.EventType.TEXT_DELETED) {
    this.string_ = this.string_.slice(0, event.index) + this.string_.slice(event.index + event.text.length);
    this.shiftReferencesOnDelete_(event.index, event.text.length);
  } else if(event.type == rdm.EventType.TEXT_INSERTED) {
    this.string_ = this.string_.slice(0, event.index) + event.text + this.string_.slice(event.index);
    this.shiftReferencesOnInsert_(event.index, event.text.length);
  }
};
