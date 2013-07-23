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

rdm.local.LocalDocument = function() {
  this.model_ = new rdm.local.LocalModel();
};
rdm.local.LocalDocument.prototype.getModel = function() {
  return this.model_;
};

rdm.local.LocalDocument.prototype.close = function() {};
rdm.local.LocalDocument.prototype.exportDocument = function(successFn, failureFn) {
  try {
    successFn(json.stringify(model.root));
  } catch(e) {
    // TODO is anything passed to the failure function? the exception?
    failureFn(e);
  }
};

// TODO how to do events?
// StreamController<rt.CollaboratorLeftEvent> _onCollaboratorLeft = new StreamController<rt.CollaboratorLeftEvent>.broadcast();
// StreamController<rt.CollaboratorJoinedEvent> _onCollaboratorJoined = new StreamController<rt.CollaboratorJoinedEvent>.broadcast();
// // TODO support implementing a document supplier class to retrieve documents and give them back in json
// StreamController<rt.DocumentSaveStateChangedEvent> _onDocumentSaveStateChanged = new StreamController<rt.DocumentSaveStateChangedEvent>.broadcast();
// Stream<rt.CollaboratorLeftEvent> get onCollaboratorLeft => _onCollaboratorLeft.stream;
// Stream<rt.CollaboratorJoinedEvent> get onCollaboratorJoined => _onCollaboratorJoined.stream;
// Stream<rt.DocumentSaveStateChangedEvent> get onDocumentSaveStateChanged => _onDocumentSaveStateChanged.stream;
