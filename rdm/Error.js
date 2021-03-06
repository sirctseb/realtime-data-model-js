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

goog.provide('rdm.Error');
goog.require('rdm.ErrorType');

/**
 * An error affecting the realtime document.
 * @constructor
 *
 * @param {rdm.ErrorType} type The type of the error that occurred.
 * @param {string} message A message describing the error.
 * @param {boolean} isFatal Whether the error is fatal.
 */
rdm.BaseModelEvent = function(type, message, isFatal) {
	/**
	 * Whether the error is fatal. Fatal errors cannot be recovered from and
	 * require the document to be reloaded.
	 * @type boolean
	 */
	this.isFatal = isFatal;
	/**
	 * A message describing the Error.
	 * @type string
	 */
	this.message = message;
	/**
	 * The type of the error that occurred.
	 * @type rdm.ErrorType
	 */
	this.type = type;
};