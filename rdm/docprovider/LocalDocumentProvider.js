// Copyright (c) 2013, Christopher Best
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless addDependencyd by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

goog.provide('rdm.LocalDocumentProvider');
goog.require('rdm.DocumentProvider');
goog.require('rdm.CustomObject');
goog.require('rdm.Model');
goog.require('rdm.Document');

/**
 * A class to create local documents with no persistence
 * @constructor
 */
rdm.LocalDocumentProvider = function() {
  rdm.DocumentProvider.call(this);
};
goog.inherits(rdm.LocalDocumentProvider, rdm.DocumentProvider);

rdm.LocalDocumentProvider.prototype.loadDocument = function(onLoaded, opt_initializerFn, opt_errorFn) {
  // create the model object
  var model = new rdm.Model();
  // create the document
  this.document = new rdm.Document(model);
  // initialize the model with callback
  model.initialize_(opt_initializerFn);
  // call the loaded callback
  onLoaded(this.document);
};

rdm.LocalDocumentProvider.exportDocument = function(onExported) {
  onExported(this.document.getModel().toJSON());
};
