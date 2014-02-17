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

goog.provide('rdm.EventType');

/**
 * Events fired by the document or collaborative object.
 * @enum {string}
 */
rdm.EventType = {
  /**
   * A new collaborator joined the document. Listen on the rdm.Document for
   * these changes.
   */
  'COLLABORATOR_JOINED': 'collaborator_joined',
  /**
   * A collaborator left the document. Listen on the rdm.Document for these
   * changes.
   */
  'COLLABORATOR_LEFT': 'collaborator_left',
  /**
   * The document save state changed. Listen on the rdm.Document for these
   * changes.
   */
  'DOCUMENT_SAVE_STATE_CHANGED': 'document_save_state_changed',
  /**
   * A collaborative object has changed. This event wraps a specific event,
   * and bubbles to ancestors.
   */
  'OBJECT_CHANGED': 'object_changed',
  /**
   * An index reference changed.
   */
  'REFERENCE_SHIFTED': 'reference_shifted',
  /**
   * Text has been removed from a string.
   */
  'TEXT_DELETED': 'text_deleted',
  /**
   * Text has been inserted into a string.
   */
  'TEXT_INSERTED': 'text_inserted',
  // TODO documentation missing from rt
  'UNDO_REDO_STATE_CHANGED': 'undo_redo_state_changed',
  /**
   * New values have been added to the list.
   */
  'VALUES_ADDED': 'values_added',
  /**
   * Values have been removed from the list.
   */
  'VALUES_REMOVED': 'values_removed',
  /**
   * Values in a list are changed in place.
   */
  'VALUES_SET': 'values_set',
  /**
   * A map or custom object value has changed. Note this could be a new value or
   * deleted value.
   */
  'VALUE_CHANGED': 'value_changed'
};
