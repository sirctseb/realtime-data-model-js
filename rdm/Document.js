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

/**
 * A Realtime document. A document consists of a Realtime model and a set of
 * collaborators. Listen on the document for the following events:
 * <ul>
 * <li>rdm.EventType.COLLABORATOR_LEFT
 * <li>rdm.EventType.COLLABORATOR_JOINED
 * <li>rdm.EventType.DOCUMENT_SAVE_STATE_CHANGED
 * </ul>
 * <p>This class should not be instantiated directly. The document object is
 * generated during the document load process.</p>
 *
 * @constructor
 * @extends goog.events.EventTarget
 * @param {rdm.Model} model The document model.
 */
rdm.Document = function(model) {
  goog.events.EventTarget.call(this);
  /**
   * The document model.
   * @type rdm.Model
   * @private
   */
  this.model_ = model;
};
goog.inherits(rdm.Document, goog.events.EventTarget);

/**
 * Gets the collaborative model associated with this document.
 * @return {rdm.Model} The collaborative model for this document.
 */
rdm.Document.prototype.getModel = function() {
  return this.model_;
};

// TODO update documentation
// TODO implement
/**
 * Closes the document and disconnects from the server. After this function is
 * called, event listeners will no longer fire and attempts to access the
 * document, model, or model object will throw a
 * {gapi.drive.realtime.DocumentClosedError}. Calling this function after the
 * document has been closed will have no effect.
 */
rdm.Document.prototype.close = function() {};

/**
 * Gets an array of collaborators active in this session. Each collaborator is
 * a jsMap with these fields: sessionId, userId, displayName, color, isMe,
 * isAnonymous.
 * @return {Array.<rdm.Collaborator>} A jsArray of collaborators.
 */
rdm.Document.prototype.getCollaborators = function() {
  return [new rdm.Collaborator()];
};

// TODO event add/removeEventListener methods are documented in rt
