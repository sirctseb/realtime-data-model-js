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

goog.provide('rdm.PersistentDocProvider');
goog.require('rdm.DocumentProvider');
goog.require('rdm.BatchStrategy');

/**
 * A class to provide non Google Drive documents with persistence
 * @constructor
 */
rdm.PersistentDocProvider = function() {
  rdm.DocumentProvider.call(this);
  /**
   * The strategy to determine when document changes should be saved.
   */
  this.batchStrategy = null;
  /**
   * If true, the client has mutations that have not yet been sent to the server.
   * If false, all mutations have been sent to the server, but some may not yet have been acked.
   */
  this.isPending = false;
  /**
   * If true, the document is in the process of saving.
   * Mutations have been sent to the server, but we have not yet received an ack.
   * If false, nothing is in the process of being sent.
   */
  this.isSaving = false;
};
goog.inherits(rdm.PersistentDocProvider, rdm.DocumentProvider);

rdm.PersistentDocProvider.prototype.loadDocument = function(onLoaded, opt_initializerFn, opt_errorFn) {
  var doInitialSave = false;
  var this_ = this;
  // get document from persistent storage
  this.getDocument(function(retrievedDoc) {
    var model;
    // if retrieved doc is empty, pass normal initializeModel
    if(retrievedDoc == "") {
      model = new rdm.local.LocalModel();
      model.initialize_(opt_initializerFn);
      doInitialSave = true;
    } else {
      // otherwise, initialize with json data
      model = new rdm.local.LocalModel();
      // TODO implement json initialization for model
      model.initializeFromJSON_(JSON.parse(retrievedDoc));
    }
    // listen for changes on model
    model.getRoot().addEventListener(
      rdm.EventType.OBJECT_CHANGED,
      function(event) {
        this_.onDocumentChange_(event);
      }
    );
    // create batch strategy
    this_.batchStrategy = new rdm.DelayStrategy(model, 1000);
    // create a document with the model
    this_.document = new rdm.local.LocalDocument(model);
    // if document had not been loaded before, do initial save
    if(doInitialSave) {
      saveDocument();
    }
    onLoaded(this.document);
  });
};

rdm.PersistentDocProvider.prototype.onDocumentChange_ = function(event) {
  var lastIsPending = this.isPending;
  this.isPending = true;
  // if pending has changed, send change event
  if(lastIsPending != this.isPending) {
    // TODO implement on local document
    this.document.changeSaveState(this.isPending, this.isSaving);
  }
};

rdm.PersistentDocProvider.prototype.saveDocument_ = function(save) {
  // if already saving, return false
  if(this.isSaving) return false;
  this.isPending = false;
  this.isSaving = true;
  // send state changed event
  this.document.changeSaveState(this.isPending, this.isSaving);
  var this_ = this;
  this.saveDocument(function(saved) {
    if(!saved) {
      // TODO save error?
    } else {
      var lastIsSaving = this_.isSaving;
      this_.isSaving = false;
      if(lastIsSaving != this_.isSaving) {
        this_.document.changeSaveState(this.isPending, this.isSaving);
      }
    }
  });
};

rdm.PersistentDocProvider.prototype.exportDocument = function(callback) {
  // TODO implement toJSON for local model
  callback(JSON.stringify(this.document.getModel().toJSON()));
};

/**
 * @interface
 */
rdm.PersistentDocProvider.prototype.getDocument = function(callback) {};

/**
 * @interface
 */
 rdm.PersistentDocProvider.prototype.saveDocument = function(callback) {};
