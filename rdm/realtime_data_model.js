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

goog.provide('rdm');

// goog.require('rdm.local');
goog.require('rdm.local.LocalModel');
goog.require('rdm.local.LocalDocument');

/** Starts the realtime system
 * @expose
 * If local is false, uses realtime-client-utils.js method for creating a new realtime-connected document
 * If local is true, a new local model will be created
 */
 rdm.start = function(realtimeOptions, local) {
  if(local) {
    var model = new rdm.local.LocalModel(realtimeOptions['initializeModel']);
    // initialize
    // TODO (cjb) consider doing this in model constructor
    model.initialize_(realtimeOptions["initializeModel"]);
    // create a document with the model
    var document = new rdm.local.LocalDocument(model);
    // do onFileLoaded callback
    realtimeOptions["onFileLoaded"](document);
  } else {
    // create loader and start
	var realtimeLoader = new rtclient.RealtimeLoader(realtimeOptions);
	realtimeLoader.start();
  }
}

window['rdm'] = rdm;