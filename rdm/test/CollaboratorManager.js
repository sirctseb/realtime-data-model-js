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

goog.provide('rdm.test.CollaboratorManager');

goog.require('rdm.Document');
goog.require('rdm.Collaborator');
goog.require('rdm.CollaboratorJoinedEvent');
goog.require('rdm.CollaboratorLeftEvent');

/**
 * A creator and manager of collaborators for testing local documents.
 * @param {rdm.Document} document The Document this manages collaborators for.
 */
rdm.test.CollaboratorManager = function(document) {
  /**
   * The Document this manages collaborators for.
   * @type {rdm.Document}
   * @private
   */
  this.document_ = document;

  /**
   * All the Collaboarators available to be added.
   * @type {Array.<rdm.Collaborator>}
   * @private
   */
  // TODO this assumes there is exactly one collaborator in the document that is Me
  this.collaborators_ = [this.document_.collaborators_[0]];
  for(var i = 1; i < rdm.test.CollaboratorManager.colors_.length; i++) {
    this.collaborators.push(new rdm.Collaborator(
        rdm.test.CollaboratorManager.colors_[i],
        'Collaborator ' + i,
        false,
        false,
        null,
        null,
        '' + i));
  }
};

/**
 * Make a Collaborator join the Document.
 */
rdm.test.CollaboratorManager.prototype.enrollCollaborator = function() {
  // find the first unenrolled collaborator
  for(var i = 0; i < this.collaborators_.length; i++) {
    if(this.document_.collaborators_.indexOf(this.collaborators_[i]) === -1) {
      // enroll collaborator

      // create event
      var event = new rdm.CollaboratorJoinedEvent(this.document_, this.collaborators_[i]);

      // add to document list
      this.document_.collaborators_.push(event.collaborator);

      // dispatch event
      this.document_.dispatchEvent(event);

      return;
    }
  }

  throw 'No more available collaborators to enroll';
};

/**
 * Make a Collaborator leave the Document.
 * The Collaborator must be enrolled and can not be Me.
 * @param {rdm.Collaborator} collaborator The Collaborator to disenroll.
 */
rdm.test.CollaboratorManager.prototype.disenrollCollaborator = function(collaborator) {
  // remove the collaborator from the document
  var index = this.document_.collaborators_.indexOf(collaborator);
  if(index === -1) {
    throw 'Collaborator is not enrolled';
  }

  // disallow disenrollment of self
  if(collaborator.isMe) {
    throw 'Cannot disenroll Me. Change Me before disenrolling';
  }

  // disenroll collaborator

  // create event
  var event = new rdm.CollaboratorLeftEvent(this.document_, collaborator);

  // remove from document list
  // TODO check syntax
  this.document_collaborators_.splice(index, 1);

  // dispatch event
  this.document_.dispatchEvent(event);
};

/**
 * Make a Collaborator on the Document Me.
 * The Collaborator must be enrolled.
 * @param {rdm.Collaborator} collaborator The collaborator to make Me.
 */
rdm.test.CollaboratorManager.prototype.setMe = function(collaborator) {
  // check that collaborator is enrolled
  if(this.document_.collaborators_.indexOf(collaborator) == -1) {
    throw 'Collaborator must be enrolled to be Me';
  }

  // find current Me and make not Me
  for(var i = 0; i < this.document_.collaborators_.length; i++) {
    if(this.document_.collaborators_[i].isMe) {
      this.document_.collaborators_[i].isMe = false;
    }
  }

  // make collaborator Me
  collaborator.isMe = true;
};

/**
 * Set the Collaborator that performs new document changes.
 * @param {rdm.Collaborator} collaborator The collaborator that will make changes.
 */
rdm.test.CollaboratorManager.prototype.setActiveCollaborator = function(collaborator) {
  // check that collaborator is enrolled
  if(this.document_.collaborators_.indexOf(collaborator) == -1) {
    throw 'Collaborator must be enrolled to be Me';
  }

  // set static values on BaseModelEvent
  rdm.BaseModelEvent.isLocal = collaborator.isMe;
  rdm.BaseModelEvent.userId = collaborator.userId;
};

/**
 * Colors to use for Collaborators
 * @type {Array.<String>}
 * @private
 */
rdm.test.CollaboratorManager.colors_ = [
  'blue',
  'red',
  'green',
  'yellow',
  'purple',
  'orange'
];
