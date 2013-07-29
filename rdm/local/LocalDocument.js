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

goog.provide('rdm.local.LocalDocument');
goog.require('goog.events.EventTarget');

rdm.local.LocalDocument = function(model) {
  goog.events.EventTarget.call(this);
  this.model_ = model;
};
goog.inherits(rdm.local.LocalDocument, goog.events.EventTarget);

/**
 * @expose
 */
rdm.local.LocalDocument.prototype.getModel = function() {
  return this.model_;
};

/**
 * @expose
 */
rdm.local.LocalDocument.prototype.close = function() {};

/**
 * @expose
 */
rdm.local.LocalDocument.prototype.exportDocument = function(successFn, failureFn) {
  try {
    successFn(JSON.stringify(this.model_.getRoot()));
  } catch(e) {
    // TODO is anything passed to the failure function? the exception?
    failureFn(e);
  }
};

// TODO should we return one collaborator with isMe?
/**
 * @expose
 */
rdm.local.LocalDocument.prototype.getCollaborators = function() {
  return [];
}

// TODO support implementing a document supplier class to retrieve documents and give them back in json
