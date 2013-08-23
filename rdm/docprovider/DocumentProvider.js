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

goog.provide('rdm.DocumentProvider');

/**
 * A class to create a load realtime documents
 * @constructor
 * @interface
 */
rdm.DocumentProvider = function() {
  /**
   * The Document provided by this provider.
   * Null until the onFileLoaded callback passed to loadDocument is called
   */
  this.document = null;
};

/**
 * Load the document provided by this DocumentProvider
 * @interface
 */
rdm.DocumentProvider.prototype.loadDocument = function(onLoaded, opt_initializerFn, opt_errorFn) {};

/**
 * Export document to json format as returned by drive.realtime.get.
 * See https://developers.google.com/drive/v2/reference/realtime/get
 * The json format is undocumented as of 2013-8-15
 * @interface
 */
rdm.DocumentProvider.prototype.exportDocument = function(onExported) {};