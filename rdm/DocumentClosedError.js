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

goog.provide('rdm.DocumentClosedError');
goog.require('goog.debug.Error');

/**
 * An error that is thrown when attempting to access a closed document (or and
 * model or collaborative object associated with a closed document).
 * @constructor
 * @extends {goog.debug.Event}
 */
rdm.DocumentClosedError = function() {
  goog.debug.Error.call(this, 'Document is closed.');
};
goog.inherits(rdm.DocumentClosedError, goog.debug.Error);
