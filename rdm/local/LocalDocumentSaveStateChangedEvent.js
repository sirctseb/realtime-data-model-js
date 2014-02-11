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

goog.provide('rdm.local.LocalDocumentSaveStateChangedEvent');
goog.require('goog.events.Event');

rdm.local.LocalDocumentSaveStateChangedEvent = function(document, isSaving, isPending) {
	goog.events.Event.call(this, rdm.EventType.DOCUMENT_SAVE_STATE_CHANGED, document);
	this.isSaving = isSaving;
	this.isPending = isPending;
};
