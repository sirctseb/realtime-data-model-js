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

goog.provide('rdm.CollaboratorLeftEvent');
goog.require('goog.events.Event');

/**
 * An event indicating that a collaborator left the document.
 * @constructor
 * @extends goog.events.Event
 * @param {rdm.Document} document The document the collaborator left.
 * @param {rdm.Collaborator} collaborator The collaborator that left.
 */
rdm.CollaboratorLeftEvent = function(document, collaborator) {
  goog.events.Event.call(this, 'collaborator_left', document);
  /**
   * The collaborator that left.
   *
   * @type rdm.Collaborator
   */
  this.collaborator = collaborator;
};

goog.inherits(rdm.CollaboratorLeftEvent, goog.events.Event);
