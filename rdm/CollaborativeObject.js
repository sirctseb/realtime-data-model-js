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

goog.provide('rdm.CollaborativeObject');
goog.require('rdm.CollaborativeObjectBase');

// TODO rt has this extending EventTarget
// TODO rt has documentation for toString and add/removeEventListener
/**
 * CollaborativeObject contains behavior common to all built in collaborative
 * types. This class should not be instantiated directly. Use the create*
 * methods on rdm to create specific types of collaborative objects.
 *
 * @constructor
 * @extends {rdm.CollaborativeObjectBase}
 * @param {rdm.Model} model The document model
 */
rdm.CollaborativeObject = function(model) {
  rdm.CollaborativeObjectBase.call(this, model);
  Object.defineProperties(this, {
    /**
     * The id of the collaborative object. Readonly.
     *
     * @type string
     * @instance
     * @memberOf rdm.CollaborativeObject
     */
    'id': { get: function() {
      rdm.Document.verifyDocument_(this);
      return this.id_;
    }}
  });
};
goog.inherits(rdm.CollaborativeObject, rdm.CollaborativeObjectBase);

/**
 * Returns the object id.
 *
 * @return {string} The id.
 */
rdm.CollaborativeObject.prototype.getId = function() {
  rdm.Document.verifyDocument_(this);
  return this.id_;
};
