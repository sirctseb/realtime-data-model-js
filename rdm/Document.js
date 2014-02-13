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

goog.provide('rdm.Document');
goog.require('goog.events.EventTarget');
goog.require('rdm.Collaborator');

rdm.Document = function(model) {
  goog.events.EventTarget.call(this);
  this.model_ = model;
};
goog.inherits(rdm.Document, goog.events.EventTarget);

/**
 * @expose
 */
rdm.Document.prototype.getModel = function() {
  return this.model_;
};

/**
 * @expose
 */
rdm.Document.prototype.close = function() {};

/**
 * @expose
 */
rdm.Document.prototype.exportDocument = function(successFn, failureFn) {
  try {
    successFn(JSON.stringify(this.model_.getRoot()));
  } catch(e) {
    failureFn(e);
  }
};

/**
 * @expose
 */
rdm.Document.prototype.getCollaborators = function() {
  return [new rdm.Collaborator()];
}

// TODO support implementing a document supplier class to retrieve documents and give them back in json
