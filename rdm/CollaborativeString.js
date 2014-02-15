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

goog.provide('rdm.CollaborativeString');
goog.require('rdm.EventType');
goog.require('rdm.IndexReferenceContainer');
goog.require('rdm.TextDeletedEvent');
goog.require('rdm.TextInsertedEvent');

rdm.CollaborativeString = function(model, initialValue) {
  rdm.IndexReferenceContainer.call(this, model);
  this.string_ = initialValue || '';
  Object.defineProperty(this, 'length', {
    get: function() { return this.string_.length; }
  });
};
goog.inherits(rdm.CollaborativeString, rdm.IndexReferenceContainer);


/**
 * @expose
 */
rdm.CollaborativeString.prototype.append = function(text) {
  var insertEvent = new rdm.TextInsertedEvent(this, this.string_.length, text);
  this.emitEventsAndChanged_([insertEvent]);
};


/**
 * @expose
 */
rdm.CollaborativeString.prototype.getText = function() {
  return this.string_;
};


/**
 * @expose
 */
rdm.CollaborativeString.prototype.insertString = function(index, text) {
  var insertEvent = new rdm.TextInsertedEvent(this, index, text);
  this.emitEventsAndChanged_([insertEvent]);
};


/**
 * @expose
 */
rdm.CollaborativeString.prototype.removeRange = function(startIndex, endIndex) {
  // get removed text for event
  var removed = this.string_.slice(startIndex, endIndex);
  // add event to stream
  var deleteEvent = new rdm.TextDeletedEvent(this, startIndex, removed);
  this.emitEventsAndChanged_([deleteEvent]);
};


/**
 * @expose
 */
rdm.CollaborativeString.prototype.setText = function(text) {
  // calculate diffs
  var diffs = rdm.CollaborativeString.stringDiff(this.string_, text);
  var this_ = this;
  var events = diffs.map(function(diff) {
    return diff.type === 'add' ?
      new rdm.TextInsertedEvent(this_, diff.index, diff.text) :
      new rdm.TextDeletedEvent(this_, diff.index, diff.text);
  });
  this.emitEventsAndChanged_(events);
};

rdm.CollaborativeString.stringDiff = function(string1, string2) {
  var C = new Array(string1.length + 1);
  for (var i = 0; i <= string1.length; i++) {
    C[i] = new Array(string2.length + 1);
    C[i][0] = 0;
  }
  for (var i = 0; i <= string2.length; i++) {
    C[0][i] = 0;
  }
  for (var i = 1; i <= string1.length; i++) {
    for (var j = 1; j <= string2.length; j++) {
      if (string1[i - 1] === string2[j - 1]) {
        var c = C[i - 1][j - 1] + 1;
        C[i][j] = c;
      } else {
        C[i][j] = Math.max(C[i][j - 1], C[i - 1][j]);
      }
    }
  }
  var diff = rdm.CollaborativeString.printDiff(C, string1, string2, string1.length, string2.length);
  // adjust indices
  var offset;
  if (diff.length > 0) {
    offset = diff[0].text.length * (diff[0].type === 'add' ? 1 : -1);
  }
  for (var i = 1; i < diff.length; i++) {
    if (diff[i].type == 'delete') {
      diff[i].index += offset;
    }
    offset += diff[i].text.length * (diff[i].type === 'add' ? 1 : -1);
  }
  return diff;
};
rdm.CollaborativeString.printDiff = function(C, string1, string2, i, j, diff) {
  diff = diff || [];
  if (i > 0 && j > 0 && string1[i - 1] === string2[j - 1]) {
    diff = rdm.CollaborativeString.printDiff(C, string1, string2, i - 1, j - 1, diff);
  } else if (i > 0 && (j === 0 || C[i][j - 1] < C[i - 1][j])) {
    diff = rdm.CollaborativeString.printDiff(C, string1, string2, i - 1, j, diff);
    if (diff.length > 0 && diff[diff.length - 1].type === 'delete' && diff[diff.length - 1].toIndex === i - 2) {
      diff[diff.length - 1].text = diff[diff.length - 1].text + string1[i - 1];
      diff[diff.length - 1].toIndex = i - 1;
    } else {
      diff.push({type: 'delete', text: string1[i - 1], index: i - 1, toIndex: i - 1});
    }
  } else if (j > 0 && (i === 0 || C[i][j - 1] >= C[i - 1][j])) {
    diff = rdm.CollaborativeString.printDiff(C, string1, string2, i, j - 1, diff);
    if (diff.length > 0 && diff[diff.length - 1].type === 'add' && diff[diff.length - 1].toIndex === j - 2) {
      diff[diff.length - 1].text = diff[diff.length - 1].text + string2[j - 1];
      diff[diff.length - 1].toIndex = j - 1;
    } else {
      diff.push({type: 'add', text: string2[j - 1], index: j - 1, toIndex: j - 1});
    }
  }
  return diff;
};

rdm.CollaborativeString.prototype.executeEvent_ = function(event) {
  if (event.type == rdm.EventType.TEXT_DELETED) {
    this.string_ = this.string_.slice(0, event.index) + this.string_.slice(event.index + event.text.length);
    this.shiftReferencesOnDelete_(event.index, event.text.length);
  } else if (event.type == rdm.EventType.TEXT_INSERTED) {
    this.string_ = this.string_.slice(0, event.index) + event.text + this.string_.slice(event.index);
    this.shiftReferencesOnInsert_(event.index, event.text.length);
  }
};

rdm.CollaborativeString.prototype.toString = function() {
  return this.string_;
};
