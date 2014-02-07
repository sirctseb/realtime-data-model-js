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
  // calculate diffs
  var diffs = rdm.local.LocalModelString.stringDiff(this.string_, text);
  var this_ = this;
  var events = diffs.map(function(diff) {
    return diff.type === 'add' ?
      new rdm.local.LocalTextInsertedEvent(this_, diff.index, diff.text) :
      new rdm.local.LocalTextDeletedEvent(this_, diff.index, diff.text);
  });
  this.emitEventsAndChanged_(events);
};

rdm.local.LocalModelString.stringDiff = function(string1, string2) {
  var C = new Array(string1.length+1);
  for(var i = 0; i <= string1.length; i++) {
    C[i] = new Array(string2.length+1);
    C[i][0] = 0;
  }
  for(var i = 0; i <= string2.length; i++) {
    C[0][i] = 0;
  }
  for(var i = 1; i <= string1.length; i++) {
    for(var j = 1; j <= string2.length; j++) {
      if(string1[i-1] === string2[j-1]) {
        var c = C[i-1][j-1] + 1;
        C[i][j] = c;
      } else {
        C[i][j] = Math.max(C[i][j-1], C[i-1][j]);
      }
    }
  }
  var diff = rdm.local.LocalModelString.printDiff(C, string1, string2, string1.length, string2.length);
  // adjust indices
  var offset;
  if(diff.length > 0) {
    offset = diff[0].text.length * (diff[0].type === 'add' ? 1 : -1);
  }
  for(var i = 1; i < diff.length; i++) {
    if(diff[i].type == 'delete') {
      diff[i].index += offset;
    }
    offset += diff[i].text.length * (diff[i].type === 'add' ? 1 : -1);
  }
  console.log(C);
  return diff;
};
rdm.local.LocalModelString.printDiff = function(C, string1, string2, i, j, diff) {
  diff = diff || [];
  if(i > 0 && j > 0 && string1[i-1] === string2[j-1]) {
    diff = rdm.local.LocalModelString.printDiff(C, string1, string2, i-1, j-1, diff);
  } else if(i > 0 && (j === 0 || C[i][j-1] < C[i-1][j])) {
    diff = rdm.local.LocalModelString.printDiff(C, string1, string2, i-1, j, diff);
    if(diff.length > 0 && diff[diff.length - 1].type === 'delete' && diff[diff.length - 1].toIndex === i-2) {
      diff[diff.length - 1].text = diff[diff.length - 1].text + string1[i-1];
      diff[diff.length - 1].toIndex = i-1;
    } else {
      diff.push({type: 'delete', text: string1[i-1], index: i-1, toIndex: i-1});
    }
  } else if(j > 0 && (i === 0 || C[i][j-1] >= C[i-1][j])) {
    diff = rdm.local.LocalModelString.printDiff(C, string1, string2, i, j-1, diff);
    if(diff.length > 0 && diff[diff.length - 1].type === 'add' && diff[diff.length - 1].toIndex === j-2) {
      diff[diff.length - 1].text = diff[diff.length - 1].text + string2[j-1];
      diff[diff.length - 1].toIndex = j-1;
    } else {
      diff.push({type: 'add', text: string2[j-1], index: j-1, toIndex: j-1});
    }
  }
  return diff;
};

rdm.local.LocalModelString.prototype.executeEvent_ = function(event) {
  if(event.type == rdm.EventType.TEXT_DELETED) {
    this.string_ = this.string_.slice(0, event.index) + this.string_.slice(event.index + event.text.length);
    this.shiftReferencesOnDelete_(event.index, event.text.length);
  } else if(event.type == rdm.EventType.TEXT_INSERTED) {
    this.string_ = this.string_.slice(0, event.index) + event.text + this.string_.slice(event.index);
    this.shiftReferencesOnInsert_(event.index, event.text.length);
  }
};
