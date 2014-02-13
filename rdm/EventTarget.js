// Copyright 2005 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Implementation of EventTarget as defined by W3C DOM 2/3.
 *
 * @author arv@google.com (Erik Arvidsson) [Original implementation]
 * @author pupius@google.com (Daniel Pupius) [Port to use goog.events]
 * @author bestchris@gmail.com (Christopher Best) Modified for multiple parents 
 *  and taken out of closure library
 * @see ../demos/eventtarget.html
 */

// TODO document everything as rdm.BaseModelEvent because we use rdm.BaseModelEvent.bubbles
goog.provide('rdm.BaseModelEventTarget');

goog.require('goog.array');
goog.require('goog.asserts');
goog.require('goog.events.Event');
goog.require('goog.events.ListenerMap');
goog.require('goog.object');



/**
 * Inherit from this class to give your object the ability to dispatch events.
 * Note that this class provides event <em>sending</em> behaviour, not event
 * receiving behaviour: your object will be able to broadcast events, and other
 * objects will be able to listen for those events using addEventListener.
 *
 * <p>The name "EventTarget" reflects the fact that this class approximately implements
 * the <a href="http://www.w3.org/TR/DOM-Level-2-Events/events.html">
 * EventTarget interface</a> as defined by W3C DOM 2/3, with a few differences:
 * <ul>
 * <li>Event objects do not have to implement the Event interface. An object
 *     is treated as an event object if it has a 'type' property.
 * <li>You can use a plain string instead of an event object; an event-like
 *     object will be created with the 'type' set to the string value.
 * <li>An EventTarget may have multiple parents
 * </ul>
 *
 * <p>Unless propagation is stopped, an event dispatched by an EventTarget
 * will bubble to the parent returned by <code>getParentEventTarget</code>.
 * To set the parent, call <code>setParentEventTarget</code> or override
 * <code>getParentEventTarget</code> in a subclass.  Subclasses that don't
 * support changing the parent should override the setter to throw an error.
 *
 * <p>Example usage:
 * <pre>
 *   var source = new rdm.BaseModelEventTarget();
 *   function handleEvent(event) {
 *     alert('Type: ' + e.type + '\nTarget: ' + e.target);
 *   }
 *   source.addEventListener('foo', handleEvent);
 *   ...
 *   source.dispatchEvent({type: 'foo'}); // will call handleEvent
 *   // or source.dispatchEvent('foo');
 *   ...
 *   goog.events.unlisten(source, 'foo', handleEvent);
 *   source.removeEventListener('foo', handlEvent);
 *
 * </pre>
 *
 * @constructor
 */
rdm.BaseModelEventTarget = function() {
  goog.Disposable.call(this);

  /**
   * Maps of event type to an array of listeners.
   *
   * @type {Object.<string, !Array.<!goog.events.ListenableKey>>}
   * @private
   */
  this.eventTargetListeners_ = new goog.events.ListenerMap(this);

  /**
   * Parent event targets, used during event bubbling.
   * @type {rdm.BaseModelEventTarget?}
   * @private
   */
   this.parentEventTargets_ = [];
};
goog.inherits(rdm.BaseModelEventTarget, goog.Disposable);


/**
 * Used to tell if an event is a real event in goog.events.listen() so we don't
 * get listen() calling addEventListener() and vice-versa.
 * @type {boolean}
 * @private
 */
rdm.BaseModelEventTarget.prototype.customEvent_ = true;


/**
 * Returns the parents of this event target to use for bubbling.
 *
 * @return {rdm.BaseModelEventTarget} The parent EventTargets
 */
rdm.BaseModelEventTarget.prototype.getParentEventTargets = function() {
  return this.parentEventTargets_;
};


/**
 * Adds a parent of this event target to use for bubbling.
 *
 * @param {rdm.BaseModelEventTarget?} parent Parent EventTarget.
 */
rdm.BaseModelEventTarget.prototype.addParentEventTarget = function(parent) {
  goog.array.insert(this.parentEventTargets_, parent);
};


/**
 * Removes a parent of this event target.
 *
 * @param {rdm.BaseModelEventTarget?} parent Parent EventTarget.
 */
rdm.BaseModelEventTarget.prototype.removeParentEventTarget = function(parent) {
  goog.array.remove(this.parentEventTargets_, parent);
};


/**
 * Adds an event listener to the event target. The same handler can only be
 * added once per the type. Even if you add the same handler multiple times
 * using the same type then it will only be called once when the event is
 * dispatched.
 *
 * @param {string} type The type of the event to listen for.
 * @param {Function|Object} handler The function to handle the event. The
 *     handler can also be an object that implements the handleEvent method
 *     which takes the event object as argument.
 * @param {boolean=} opt_capture In DOM-compliant browsers, this determines
 *     whether the listener is fired during the capture or bubble phase
 *     of the event.
 * @param {Object=} opt_handlerScope Object in whose scope to call
 *     the listener.
 */
rdm.BaseModelEventTarget.prototype.addEventListener = function(
    type, handler, opt_capture, opt_handlerScope) {
  this.listen(type, handler, opt_capture, opt_handlerScope);
};


/**
 * Removes an event listener from the event target. The handler must be the
 * same object as the one added. If the handler has not been added then
 * nothing is done.
 * @param {string} type The type of the event to listen for.
 * @param {Function|Object} handler The function to handle the event. The
 *     handler can also be an object that implements the handleEvent method
 *     which takes the event object as argument.
 * @param {boolean=} opt_capture In DOM-compliant browsers, this determines
 *     whether the listener is fired during the capture or bubble phase
 *     of the event.
 * @param {Object=} opt_handlerScope Object in whose scope to call
 *     the listener.
 */
rdm.BaseModelEventTarget.prototype.removeEventListener = function(
    type, handler, opt_capture, opt_handlerScope) {
  this.unlisten(type, handler, opt_capture, opt_handlerScope);
};


/** @override */
rdm.BaseModelEventTarget.prototype.dispatchEvent = function(e) {
  var ancestorsTree, parents = this.getParentEventTargets();
  if (parents.length > 0) {
    ancestorsTree = parents.slice(0);
    for (var i = 0; i < ancestorsTree.length; i++) {
      var grandparents = ancestorsTree[i].getParentEventTargets();
      for (var j = 0; j < grandparents.length; j++) {
        if (ancestorsTree.indexOf(grandparents[j]) == -1) {
          ancestorsTree.push(grandparents[j]);
        }
      }
    }
  }

  return rdm.BaseModelEventTarget.dispatchEventInternal_(
    this, e, ancestorsTree);
};


/**
 * Unattach listeners from this object.  Classes that extend EventTarget may
 * need to override this method in order to remove references to DOM Elements
 * and additional listeners, it should be something like this:
 * <pre>
 * MyClass.prototype.disposeInternal = function() {
 *   MyClass.superClass_.disposeInternal.call(this);
 *   // Dispose logic for MyClass
 * };
 * </pre>
 * @override
 * @protected
 */
rdm.BaseModelEventTarget.prototype.disposeInternal = function() {
  rdm.BaseModelEventTarget.superClass_.disposeInternal.call(this);

  this.removeAllListeners();

  goog.array.clear(this.parentEventTargets_);
};


/** @override */
rdm.BaseModelEventTarget.prototype.listen = function(
    type, listener, opt_useCapture, opt_listenerScope) {
  this.assertInitialized_();
  return this.eventTargetListeners_.add(
    String(type), listener, false /* calllOnce */, opt_useCapture,
    opt_listenerScope);
};


/** @override */
rdm.BaseModelEventTarget.prototype.listenOnce = function(
    type, listener, opt_useCapture, opt_listenerScope) {
  return this.eventTargetListeners_.add(
    String(type), listener, true /* calllOnce */, opt_useCapture,
    opt_listenerScope);
};


/** @override */
rdm.BaseModelEventTarget.prototype.unlisten = function(
    type, listener, opt_useCapture, opt_listenerScope) {
  return this.eventTargetListeners_.remove(
    String(type), listener, opt_useCapture, opt_listenerScope);
};


/** @override */
rdm.BaseModelEventTarget.prototype.unlistenByKey = function(key) {
  return this.eventTargetListeners_.removeByKey(key);
};


/** @override */
rdm.BaseModelEventTarget.prototype.removeAllListeners = function(
    opt_type, opt_capture) {
  // TODO(user): Previously, removeAllListeners can be called on
  // uninitialized EventTarget, so we preserve that behavior. We
  // should remove this when usages that rely on that fact are purged.
  if (!this.eventTargetListeners_) {
    return 0;
  }
  return this.eventTargetListeners_.removeAll(opt_type);
};


/** @override */
rdm.BaseModelEventTarget.prototype.fireListeners = function(
    type, capture, eventObject) {
  // TODO(user): Original code avoids array creation when there
  // is no listener, so we do the same. If this optimization turns
  // out to be not required, we can replace this with
  // getListeners(type, capture) instead, which is simpler.
  var listenerArray = this.eventTargetListeners_.listeners[String(type)];
  if (!listenerArray) {
    return true;
  }
  listenerArray = goog.array.clone(listenerArray);

  var rv = true;
  for (var i = 0; i < listenerArray.length; ++i) {
    var listener = listenerArray[i];
    // We might not have a listener if the listener was removed.
    if (listener && !listener.removed && listener.capture == capture) {
      var listenerFn = listener.listener;
      var listenerHandler = listener.handler || listener.src;

      if (listener.callOnce) {
        this.unlistenByKey(listener);
      }
      rv = listenerFn.call(listenerHandler, eventObject) !== false && rv;
    }
  }

  return rv && eventObject.returnValue_ != false;
};


/** @override */
rdm.BaseModelEventTarget.prototype.getListeners = function(type, capture) {
  return this.eventTargetListeners_.getListeners(String(type), capture);
};


/** @override */
rdm.BaseModelEventTarget.prototype.getListener = function(
    type, listener, capture, opt_listenerScope) {
  return this.eventTargetListeners_.getListener(
      String(type), listener, capture, opt_listenerScope);
};


/** @override */
rdm.BaseModelEventTarget.prototype.hasListener = function(
    opt_type, opt_capture) {
  var id = goog.isDef(opt_type) ? String(opt_type) : undefined;
  return this.eventTargetListeners_.hasListener(id, opt_capture);
};


/**
 * Asserts that the event target instance is initialized properly.
 * @private
 */
rdm.BaseModelEventTarget.prototype.assertInitialized_ = function() {
  goog.asserts.assert(
      this.eventTargetListeners_,
      'Event target is not initialized. Did you call the superclass ' +
      '(goog.events.EventTarget) constructor?');
};


/**
 * Dispatches the given event on the ancestorsTree.
 *
 * TODO(user): Look for a way to reuse this logic in
 * goog.events, if possible.
 *
 * @param {!Object} target The target to dispatch on.
 * @param {goog.events.Event|Object|string} e The event object.
 * @param {Array.<goog.events.Listenable>=} opt_ancestorsTree The ancestors
 *     tree of the target, in reverse order from the closest ancestor
 *     to the root event target. May be null if the target has no ancestor.
 * @return {boolean} If anyone called preventDefault on the event object (or
 *     if any of the listeners returns false this will also return false.
 * @private
 */
rdm.BaseModelEventTarget.dispatchEventInternal_ = function(
    target, e, opt_ancestorsTree) {
  var type = e.type || /** @type {string} */ (e);

  // If accepting a string or object, create a custom event object so that
  // preventDefault and stopPropagation work with the event.
  if (goog.isString(e)) {
    e = new goog.events.Event(e, target);
  } else if (!(e instanceof goog.events.Event)) {
    var oldEvent = e;
    e = new goog.events.Event(type, target);
    goog.object.extend(e, oldEvent);
  } else {
    e.target = e.target || target;
  }

  var rv = true, currentTarget;

  // Executes all capture listeners on the ancestors, if any.
  if (e.bubbles) {
    if (opt_ancestorsTree) {
      for (var i = opt_ancestorsTree.length - 1; !e.propagationStopped_ && i >= 0;
       i--) {
        currentTarget = e.currentTarget = opt_ancestorsTree[i];
        rv = currentTarget.fireListeners(type, true, e) && rv;
      }
    }
  }

  // Executes capture and bubble listeners on the target.
  if (!e.propagationStopped_) {
    currentTarget = e.currentTarget = target;
    rv = currentTarget.fireListeners(type, true, e) && rv;
    if (!e.propagationStopped_) {
      rv = currentTarget.fireListeners(type, false, e) && rv;
    }
  }

  // Executes all bubble listeners on the ancestors, if any.
  if (e.bubbles) {
    if (opt_ancestorsTree) {
      for (i = 0; !e.propagationStopped_ && i < opt_ancestorsTree.length; i++) {
        currentTarget = e.currentTarget = opt_ancestorsTree[i];
        rv = currentTarget.fireListeners(type, false, e) && rv;
      }
    }
  }

  return rv;
};
