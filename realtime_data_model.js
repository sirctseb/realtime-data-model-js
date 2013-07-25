goog.provide('rdm');

// goog.require('rdm.local');
// goog.addDependency('local/local.js', ['rdm.local'], []);
goog.require('rdm.local');


/** Starts the realtime system
 * If local is false, uses realtime-client-utils.js method for creating a new realtime-connected document
 * If local is true, a new local model will be created
 */
rdm.start = function(realtimeOptions, local) {
  if(local) {
    var model = new rdm.local.LocalModel(realtimeOptions['initializeModel']);
    // initialize
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