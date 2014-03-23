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

goog.provide('rdm.Model');
goog.require('goog.events.EventTarget');
goog.require('rdm.CollaborativeList');
goog.require('rdm.CollaborativeMap');
goog.require('rdm.CollaborativeObject');
goog.require('rdm.CollaborativeString');
goog.require('rdm.CustomObject');
goog.require('rdm.UndoHistory');
goog.require('rdm.custom');

/**
 * The collaborative model is the data model for a Realtime document. The
 * document's object graph should be added to the model under the root object.
 * All objects that are part of the model must be accessible from this root.
 * <br/>
 * The model class is also used to create instances of built in and custom
 * collaborative objects via the appropriate create method.
 *
 * <p>Listen on the model for the following events:</p>
 * <ul>
 * <li>gapi.drive.realtime.EventType.UNDO_REDO_STATE_CHANGED
 * </ul>
 * This class should not be instantiated directly. The collaborative model is
 * generated during the document load process. The model can be initialized by
 * passing an initializer function to rdm.DocumentProvider.loadDocument.
 *
 * @constructor
 * @extends goog.events.EventTarget
*/
rdm.Model = function() {
  goog.events.EventTarget.call(this);

  // TODO is this Read-Only?
  /**
   * The mode of the document. If true, the document is readonly. If false it is
   * editable.
   *
   * @type boolean
   */
  this.isReadyOnly = false;
  // pass canUndo and canRedo through to undo history object
  Object.defineProperties(this, {
    /**
     * True if the model can currently undo.
     *
     * @type boolean
     * @instance
     * @memberOf rdm.Model
     */
    'canUndo': { get: function() {
      rdm.Document.verifyDocument_(this);
      return this.undoHistory_.canUndo;
    }},
    /**
     * True if the model can currently redo.
     *
     * @type boolean
     * @instance
     * @memberOf rdm.Model
     */
    'canRedo': { get: function() {
      rdm.Document.verifyDocument_(this);
      return this.undoHistory_.canRedo;
    }}
  });
  /**
   * The root of the document graph.
   *
   * @type rdm.CollaborativeMap
   * @private
   */
  this.root_ = new rdm.CollaborativeMap(this);
  /**
   * Whether the model is initialized.
   *
   * @type boolean
   * @private
   */
  this.isInitialized_ = false;
};
goog.inherits(rdm.Model, goog.events.EventTarget);

/**
 * Initialize the model.
 *
 * @private
 * @param {function(rdm.Model)=} opt_initializerFn An optional initialization
 *     function that will be called only the first time that the document
 *     is loaded. The document's model object will be passed to this function.
 */
rdm.Model.prototype.initialize_ = function(opt_initializerFn) {
  this.undoHistory_ = new rdm.UndoHistory(this);
  if (opt_initializerFn != null) {
    this.undoHistory_.initializeModel(opt_initializerFn);
  }
  this.isInitialized_ = true;
};

/**
 * Starts a compound operation for the creation of the document's initial state.
 * @private
 */
rdm.Model.prototype.beginCreationCompoundOperation_ = function() {};

/**
 * Ends a compound operation. This method will throw an exception if no compound
 * operation is in progress.
 */
rdm.Model.prototype.endCompoundOperation = function() {
  rdm.Document.verifyDocument_(this);
  this.undoHistory_.endCompoundOperation();
};

/**
 * Returns the root of the object model
 *
 * @return {rdm.CollaborativeMap} The root of the object model.
 */
rdm.Model.prototype.getRoot = function() {
  rdm.Document.verifyDocument_(this);
  return this.root_;
};

/**
 * Returns whether the model is initialized.
 *
 * @return {boolean} Whether the model is initialized.
 */
rdm.Model.prototype.isInitialized = function() {
  rdm.Document.verifyDocument_(this);
  return isInitialized_;
};

/**
 * Starts a compound operation. If a name is given, that name will be recorded
 * for used in revision history, undo menus, etc. When beginCompoundOperation()
 * is called, all subsequent edits to the data model will be batched together in
 * the undo stack and revision history until endCompoundOperation() is called.
 * Compound operations may be nested inside other compound operations. Note that
 * the compound operation MUST start and end in the same synchronous execution
 * block. If this invariant is violated, the data model will become invalid and
 * all future changes will fail.
 *
 * @param {string=} opt_name An optional name for this compound operation.
 */
rdm.Model.prototype.beginCompoundOperation = function(opt_name) {
  rdm.Document.verifyDocument_(this);
  this.undoHistory_.beginCompoundOperation(rdm.UndoHistory.Scope.EXPLICIT_CO);
};

/**
 * Creates and returns a new collaborative object. This can be used to create
 * custom collaborative objects. For built in types, use the specific create*
 * functions.
 *
 * @param {function(*)|string} ref An object constructor or type name.
 * @param {...*} var_args Arguments to the newly-created object's initialize()
 *     method.
 * @return {Object} A new collaborative object.
 */
rdm.Model.prototype.create = function(ref, var_args) {
  rdm.Document.verifyDocument_(this);
  var name = ref;
  if (goog.isString(ref)) {
    ref = rdm.CustomObject.customTypes_[ref].type;
  } else {
    name = rdm.CustomObject.customTypeName_(ref);
  }
  // create instance
  var instance = new ref();
  // extend with local custom object
  goog.object.extend(instance, rdm.CustomObject.prototype);
  // store instance in global list
  rdm.CustomObject.instances_.push(instance);
  // call local model object constructor
  rdm.CustomObject.call(instance, this);
  // store id to model in map
  rdm.custom.customObjectModels_['' + rdm.custom.getId(instance)] = this;
  // replace collab fields by defining properties
  for (var field in rdm.CustomObject.customTypes_[name].fields) {
    Object.defineProperty(instance, field,
        rdm.CustomObject.customTypes_[name].fields[field]);
  }
  // run initializer function
  if (rdm.CustomObject.customTypes_[name].initializerFn) {
    rdm.CustomObject.customTypes_[name].initializerFn.apply(instance, var_args);
  }
  return instance;
};

// TODO why aren't the return values for these typed?
/**
 * Creates a collaborative list.
 *
 * @param {Array.<*>=} opt_initialValue Initial value for the list.
 * @return {Object} A collaborative list.
 */
rdm.Model.prototype.createList = function(opt_initialValue) {
  rdm.Document.verifyDocument_(this);
  return new rdm.CollaborativeList(this, opt_initialValue);
};

/**
 * Creates a collaborative map.
 *
 * @param {Object.<*>=} opt_initialValue Initial value for the map.
 * @return {Object} A collaborative map.
 */
rdm.Model.prototype.createMap = function(opt_initialValue) {
  rdm.Document.verifyDocument_(this);
  return new rdm.CollaborativeMap(this, opt_initialValue);
};

// TODO init value description inconsistent with list and map
/**
 * Creates a collaborative string.
 *
 * @param {string=} opt_initialValue Sets the initial value for this string.
 * @return {Object} A collaborative string.
 */
rdm.Model.prototype.createString = function(opt_initialValue) {
  rdm.Document.verifyDocument_(this);
  return new rdm.CollaborativeString(this, opt_initialValue);
};

/**
 * Undo the last thing the active colllaborator did.
 */
rdm.Model.prototype.undo = function() {
  rdm.Document.verifyDocument_(this);
  if (!this.canUndo) return;
  // undo events
  this.undoHistory_.undo();
};

/**
 * Redo the last thing the active collaborator undid.
 */
rdm.Model.prototype.redo = function() {
  rdm.Document.verifyDocument_(this);
  if (!this.canRedo) return;
  // redo events
  this.undoHistory_.redo();
};
