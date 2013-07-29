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

goog.require('rdm.local.LocalDocument');
goog.require('rdm.local.LocalEvent');
goog.require('rdm.local.LocalIndexReference');
goog.require('rdm.local.LocalIndexReferenceContainer');
goog.require('rdm.local.LocalModel');
goog.require('rdm.local.LocalModelList');
goog.require('rdm.local.LocalModelMap');
goog.require('rdm.local.LocalModelObject');
goog.require('rdm.local.LocalModelString');
goog.require('rdm.local.LocalObjectChangedEvent');
goog.require('rdm.local.LocalReferenceShiftedEvent');
goog.require('rdm.local.LocalTextDeletedEvent');
goog.require('rdm.local.LocalTextInsertedEvent');
goog.require('rdm.local.LocalUndoRedoStateChangedEvent');
goog.require('rdm.local.LocalValueChangedEvent');
goog.require('rdm.local.LocalValuesAddedEvent');
goog.require('rdm.local.LocalValuesRemovedEvent');
goog.require('rdm.local.LocalValuesSetEvent');
goog.require('rdm.local.UndoHistory');