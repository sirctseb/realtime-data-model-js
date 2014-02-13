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

goog.require('rdm.Document');
goog.require('rdm.BaseModelEvent');
goog.require('rdm.IndexReference');
goog.require('rdm.IndexReferenceContainer');
goog.require('rdm.Model');
goog.require('rdm.CollaborativeList');
goog.require('rdm.CollaborativeMap');
goog.require('rdm.CollaborativeObject');
goog.require('rdm.CollaborativeString');
goog.require('rdm.ObjectChangedEvent');
goog.require('rdm.ReferenceShiftedEvent');
goog.require('rdm.TextDeletedEvent');
goog.require('rdm.TextInsertedEvent');
goog.require('rdm.UndoRedoStateChangedEvent');
goog.require('rdm.ValueChangedEvent');
goog.require('rdm.ValuesAddedEvent');
goog.require('rdm.ValuesRemovedEvent');
goog.require('rdm.ValuesSetEvent');
goog.require('rdm.UndoHistory');