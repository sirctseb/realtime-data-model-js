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

goog.provide('rdm.Collaborator');

/**
 * A collaborator on the document.
 * @constructor
 */
rdm.Collaborator = function() {
  /**
   * The color associated with the collaborator.
   * @type {string}
   */
  this.color = 'blue';
  /**
   * The display name of the collaborator.
   * @type {string}
   */
  this.displayName = 'Me';
  /**
   * True if the collaborator is anonymous, false otherwise.
   * @type {boolean}
   */
  this.isAnonymous = false;
  /**
   * True if the collaborator is the local user, false otherwise.
   * @type {boolean}
   */
  this.isMe = true;
  /**
   * A url that points to the profile of the user.
   * @type {string}
   */
  this.photoUrl = null;
  /**
   * The sessionId of the collaborator.
   * @type {string}
   */
  this.sessionId = null;
  /**
   * The userId of the collaborator.
   * @type {string}
   */
  this.userId = 'a';
};
