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

goog.provide('rdm.LocalDocumentProvider');
goog.require('rdm.DocumentProvider');
goog.require('rdm.CustomObject');
goog.require('rdm.Model');
goog.require('rdm.Document');

/**
 * A class to create local documents with no persistence
 * @param {String} [data] Json export of the document data
 * @constructor
 */
rdm.LocalDocumentProvider = function(data) {
  rdm.DocumentProvider.call(this);
  /**
   * The data from which the document is initialized
   *
   * @type String
   * @private
   */
  this.initData_ = data;
};
goog.inherits(rdm.LocalDocumentProvider, rdm.DocumentProvider);

rdm.LocalDocumentProvider.prototype.loadDocument = function(onLoaded, opt_initializerFn, opt_errorFn) {
  // create the model object
  var model = new rdm.Model();
  // create the document
  this.document = new rdm.Document(model);
  // initialize with data if provided
  if(this.initData_) {
    model.initializeFromJson_(this.initData_);
  } else {
    // otherwise initialize the empty model with callback
    model.initialize_(opt_initializerFn);
  }
  // call the loaded callback
  onLoaded(this.document);
};

rdm.LocalDocumentProvider.prototype.exportDocument = function(onExported) {
  var result = {
    // TODO what to put in appId?
    'appId':'local',
    // TODO what to put in revision?
    'revision':1,
    'data': {
    }
  };
  var ids = {};
  result['data'] = this.document.getModel().getRoot().export(ids);
  onExported(result);
};
