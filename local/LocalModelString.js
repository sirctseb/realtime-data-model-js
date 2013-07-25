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

rdm.local.LocalModelString = function(initialValue) {
  rdm.local.LocalIndexReferenceContainer.call(this);
  this.string_ = initialValue || "";
  Object.defineProperty(this, "length", {
    get: function() { return this.string_.length; }
  });
};
goog.inherits(rdm.local.LocalModelString, rdm.local.LocalIndexReferenceContainer);


// StreamController<LocalTextInsertedEvent> onTextInserted_
//   = new StreamController<LocalTextInsertedEvent>.broadcast(sync: true);
// StreamController<LocalTextDeletedEvent> onTextDeleted_
//   = new StreamController<LocalTextDeletedEvent>.broadcast(sync: true);

rdm.local.LocalModelString.prototype.append = function(text) {
  // add event to stream
  var insertEvent = new rdm.local.LocalTextInsertedEvent(this, string_.length, text);
  emitEventsAndChanged_([onTextInserted_], [insertEvent]);
};


rdm.local.LocalModelString.prototype.getText = function() {
  return string_;
};


rdm.local.LocalModelString.prototype.insertString = function(index, text) {
  var insertEvent = new rdm.local.LocalTextInsertedEvent(this, index, text);
  emitEventsAndChanged_([onTextInserted_], [insertEvent]);
};


rdm.local.LocalModelString.prototype.removeRange = function(startIndex, endIndex) {
  // get removed text for event
  var removed = string_.slice(startIndex, endIndex);
  // add event to stream
  var deleteEvent = new rdm.local.LocalTextDeletedEvent(this.startIndex, removed);
  emitEventsAndChanged_([onTextDeleted_], [deleteEvent]);
};


rdm.local.LocalModelString.prototype.text = function(text) {
  // trivial edit decomposition algorithm
  // add event to stream
  var deleteEvent = new rdm.local.LocalTextDeletedEvent(this, 0, string_);
  var insertEvent = new rdm.local.LocalTextInsertedEvent(this, 0, text);
  emitEventsAndChanged_([onTextDeleted_, onTextInserted_], [deleteEvent, insertEvent]);
}

// TODO
// Stream<LocalTextInsertedEvent> get onTextInserted => onTextInserted_.stream;
// Stream<LocalTextDeletedEvent> get onTextDeleted => onTextDeleted_.stream;

rdm.local.LocalModelString.prototype.executeEvent_ = function(event) {
  // handle insert and delete events
  // TODO deal with type warnings
  if(event.type == rdm.local.LocalEventType.TEXTDELETED) {
    // update string
    this.string_ = this.string_.slice(0, event.index) + this.string_.slice(event.index + event.text.length);
    // update references
    shiftReferencesOnDelete_(event.index, event.text.length);
  } else if(event.type == rdm.local.LocalEventType.TEXTINSERTED) {
    // update string
    this.string_ = this.string_.slice(0, event.index) + event.text + this.string_.slice(event.index);
    // update references
    this.shiftReferencesOnInsert_(event.index, event.text.length);
  }
};
