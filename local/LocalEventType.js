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

goog.provide('rdm.local.LocalEventType');


// TODO (cjb) this depends on values that are not public in the realtime api
// TODO (cjb) if we do define them ourselves, it should not be in rdm.local, just rdm
rdm.local.LocalEventType = {
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
