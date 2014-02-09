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

goog.provide('rdm.local.Collaborator');

/**
 * A collaborator on the document.
 */
rdm.local.Collaborator = function(userId, sessionId, displayName, color, isMe, isAnonymous, photoUrl) {
	// TODO can we document fields in the constructor?
	this.userId = userId;
	this.color = color;
	this.displayName = displayName;
	this.isAnonymous = isAnonymous;
	this.isMe = isMe;
	this.photoUrl = photoUrl;
	this.sessionId = sessionId;
	this.userId = userId;
};
