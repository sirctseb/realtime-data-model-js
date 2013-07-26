goog.provide('rdm');
goog.provide('rdm.EventType');

goog.require('rdm.local');

/** Starts the realtime system
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

// TODO (cjb) this duplicates the constants in gapi.drive.realtime.EventType
// so client code can use the local library without even loading the realtime api at all
rdm.EventType = {
  'COLLABORATOR_JOINED': 'collaborator_joined',
  'COLLABORATOR_LEFT': 'collaborator_left',
  'DOCUMENT_SAVE_STATE_CHANGED': 'document_save_state_changed',
  'OBJECT_CHANGED': 'object_changed',
  'REFERENCE_SHIFTED': 'reference_shifted',
  'TEXT_DELETED': 'text_deleted',
  'TEXT_INSERTED': 'text_inserted',
  'UNDO_REDO_STATE_CHANGED': 'undo_redo_state_changed',
  'VALUES_ADDED': 'values_added',
  'VALUES_REMOVED': 'values_removed',
  'VALUES_SET': 'values_set',
  'VALUE_CHANGED': 'value_changed'
};