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

goog.provide('rdm.local');

goog.require('rdm.local.Document');
goog.require('rdm.local.Event');
goog.require('rdm.local.IndexReference');
goog.require('rdm.local.IndexReferenceContainer');
goog.require('rdm.local.Model');
goog.require('rdm.local.CollaborativeList');
goog.require('rdm.local.CollaborativeMap');
goog.require('rdm.local.CollaborativeObject');
goog.require('rdm.local.CollaborativeString');
goog.require('rdm.local.ObjectChangedEvent');
goog.require('rdm.local.ReferenceShiftedEvent');
goog.require('rdm.local.TextDeletedEvent');
goog.require('rdm.local.TextInsertedEvent');
goog.require('rdm.local.UndoRedoStateChangedEvent');
goog.require('rdm.local.ValueChangedEvent');
goog.require('rdm.local.ValuesAddedEvent');
goog.require('rdm.local.ValuesRemovedEvent');
goog.require('rdm.local.ValuesSetEvent');
goog.require('rdm.local.UndoHistory');