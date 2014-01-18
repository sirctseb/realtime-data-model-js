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

goog.provide('rdm.local.EventTarget');

// TODO check if we actually need anything
goog.require('goog.events');
goog.require('goog.events.Event');
// goog.require('goog.events.Listenable');
goog.require('goog.events.Listener');
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
 *   var source = new rdm.local.EventTarget();
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
rdm.local.EventTarget = function() {
    /**
     * Maps of event type to an array of listeners.
     *
     * @type {Object.<string, !Array.<!goog.events.ListenableKey>>}
     * @private
     */
    this.eventTargetListeners_ = {};
};


/**
 * Used to tell if an event is a real event in goog.events.listen() so we don't
 * get listen() calling addEventListener() and vice-versa.
 * @type {boolean}
 * @private
 */
// TODO probably remove
rdm.local.EventTarget.prototype.customEvent_ = true;


/**
 * Parent event targets, used during event bubbling.
 * @type {rdm.local.EventTarget?}
 * @private
 */
rdm.local.EventTarget.prototype.parentEventTargets_ = [];


/**
 * Returns the parents of this event target to use for bubbling.
 *
 * @return {rdm.local.EventTarget} The parent EventTargets
 */
rdm.local.EventTarget.prototype.getParentEventTargets = function() {
  return this.parentEventTargets_;
};


/**
 * Adds a parent of this event target to use for bubbling.
 *
 * @param {rdm.local.EventTarget?} parent Parent EventTarget.
 */
rdm.local.EventTarget.prototype.addParentEventTarget = function(parent) {
  goog.array.remove(this.parentEventTargets_, parent);
};


/**
 * Removes a parent of this event target.
 *
 * @param {rdm.local.EventTarget?} parent Parent EventTarget.
 */
rdm.local.EventTarget.prototype.removeParentEventTarget = function(parent) {
  goog.array.insert(this.parentEventTargets_, parent);
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
rdm.local.EventTarget.prototype.addEventListener = function(
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
rdm.local.EventTarget.prototype.removeEventListener = function(
    type, handler, opt_capture, opt_handlerScope) {
  this.unlisten(type, handler, opt_capture, opt_handlerScope);
};


/** @override */
rdm.local.EventTarget.prototype.dispatchEvent = function(e) {
  var ancestorsTree, parents = this.getParentEventTargets();
  if (parents.length > 0) {
    ancestorsTree = parents.slice(0);
    for (var i = 0; i < ancestorsTree.length; i++) {
      var grandparents = ancestorsTree[i];
      for (var j = 0; j < grandparents.length; j++) {
        if (ancestorsTree.indexOf(grandparents[j]) == -1) {
          ancestorsTree.push(grandparents[j]);
        }
      }
    }
  }

  return rdm.local.EventTarget.dispatchEventInternal_(
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
// TODO probably remove
rdm.local.EventTarget.prototype.disposeInternal = function() {
  goog.events.EventTarget.superClass_.disposeInternal.call(this);

  this.removeAllListeners();
  this.reallyDisposed_ = true;

  goog.array.clear(this.parentEventTargets_);
};


/** @override */
rdm.local.EventTarget.prototype.listen = function(
    type, listener, opt_useCapture, opt_listenerScope) {
  return this.listenInternal_(
      type, listener, false /* callOnce */, opt_useCapture, opt_listenerScope);
};


/** @override */
rdm.local.EventTarget.prototype.listenOnce = function(
    type, listener, opt_useCapture, opt_listenerScope) {
  return this.listenInternal_(
      type, listener, true /* callOnce */, opt_useCapture, opt_listenerScope);
};


/**
 * Adds an event listener. A listener can only be added once to an
 * object and if it is added again the key for the listener is
 * returned.
 *
 * Note that a one-off listener will not change an existing listener,
 * if any. On the other hand a normal listener will change existing
 * one-off listener to become a normal listener.
 *
 * @param {string} type Event type to listen to.
 * @param {!Function} listener Callback method.
 * @param {boolean} callOnce Whether the listener is a one-off
 *     listener or otherwise.
 * @param {boolean=} opt_useCapture Whether to fire in capture phase
 *     (defaults to false).
 * @param {Object=} opt_listenerScope Object in whose scope to call the
 *     listener.
 * @return {goog.events.ListenableKey} Unique key for the listener.
 * @private
 */
rdm.local.EventTarget.prototype.listenInternal_ = function(
    type, listener, callOnce, opt_useCapture, opt_listenerScope) {
  var listenerArray = this.eventTargetListeners_[type] ||
      (this.eventTargetListeners_[type] = []);

  var listenerObj;
  var index = rdm.local.EventTarget.findListenerIndex_(
      listenerArray, listener, opt_useCapture, opt_listenerScope);
  if (index > -1) {
    listenerObj = listenerArray[index];
    if (!callOnce) {
      // Ensure that, if there is an existing callOnce listener, it is no
      // longer a callOnce listener.
      listenerObj.callOnce = false;
    }
    return listenerObj;
  }

  // TODO keep goog.events.Listener or just assume functions?
  listenerObj = new goog.events.Listener();
  listenerObj.init(
      listener, null, this, type, !!opt_useCapture, opt_listenerScope);
  listenerObj.callOnce = callOnce;
  listenerArray.push(listenerObj);

  return listenerObj;
};


/** @override */
rdm.local.EventTarget.prototype.unlisten = function(
    type, listener, opt_useCapture, opt_listenerScope) {
  if (!(type in this.eventTargetListeners_)) {
    return false;
  }

  var listenerArray = this.eventTargetListeners_[type];
  var index = rdm.local.EventTarget.findListenerIndex_(
      listenerArray, listener, opt_useCapture, opt_listenerScope);
  if (index > -1) {
    // TODO keep goog.events.Listener or just assume function?
    var listenerObj = listenerArray[index];
    goog.events.cleanUp(listenerObj);
    listenerObj.removed = true;
    return goog.array.removeAt(listenerArray, index);
  }
  return false;
};


/** @override */
rdm.local.EventTarget.prototype.unlistenByKey = function(key) {
  var type = key.type;
  if (!(type in this.eventTargetListeners_)) {
    return false;
  }

  var removed = goog.array.remove(this.eventTargetListeners_[type], key);
  if (removed) {
    goog.events.cleanUp(key);
    key.removed = true;
  }
  return removed;
};


/** @override */
rdm.local.EventTarget.prototype.removeAllListeners = function(
    opt_type, opt_capture) {
  // TODO keep goog.events.Listener?
  var count = 0;
  for (var type in this.eventTargetListeners_) {
    if (!opt_type || type == opt_type) {
      var listenerArray = this.eventTargetListeners_[type];
      for (var i = 0; i < listenerArray.length; i++) {
        ++count;
        goog.events.cleanUp(listenerArray[i]);
        listenerArray[i].removed = true;
      }
      listenerArray.length = 0;
    }
  }
  return count;
};


/** @override */
// TODO keep goog.events.Listener?
rdm.local.EventTarget.prototype.fireListeners = function(
    type, capture, eventObject) {
  if (!(type in this.eventTargetListeners_)) {
    return true;
  }

  var rv = true;
  var listenerArray = goog.array.clone(this.eventTargetListeners_[type]);
  for (var i = 0; i < listenerArray.length; ++i) {
    var listener = listenerArray[i];
    // We might not have a listener if the listener was removed.
    if (listener && !listener.removed && listener.capture == capture) {
      // TODO(user): This logic probably should be in the Listener
      // object instead.
      if (listener.callOnce) {
        this.unlistenByKey(listener);
      }
      rv = listener.handleEvent(eventObject) !== false && rv;
    }
  }

  return rv && eventObject.returnValue_ != false;
};


/** @override */
rdm.local.EventTarget.prototype.getListeners = function(type, capture) {
  var listenerArray = this.eventTargetListeners_[type];
  var rv = [];
  if (listenerArray) {
    for (var i = 0; i < listenerArray.length; ++i) {
      var listenerObj = listenerArray[i];
      if (listenerObj.capture == capture) {
        rv.push(listenerObj);
      }
    }
  }
  return rv;
};


/** @override */
rdm.local.EventTarget.prototype.getListener = function(
    type, listener, capture, opt_listenerScope) {
  var listenerArray = this.eventTargetListeners_[type];
  var i = -1;
  if (listenerArray) {
    i = rdm.local.EventTarget.findListenerIndex_(
        listenerArray, listener, capture, opt_listenerScope);
  }
  return i > -1 ? listenerArray[i] : null;
};


/** @override */
rdm.local.EventTarget.prototype.hasListener = function(
    opt_type, opt_capture) {
  var hasType = goog.isDef(opt_type);
  var hasCapture = goog.isDef(opt_capture);

  return goog.object.some(
      this.eventTargetListeners_, function(listenersArray, type) {
        for (var i = 0; i < listenersArray.length; ++i) {
          if ((!hasType || listenersArray[i].type == opt_type) &&
              (!hasCapture || listenersArray[i].capture == opt_capture)) {
            return true;
          }
        }

        return false;
      });
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
rdm.local.EventTarget.dispatchEventInternal_ = function(
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
  if (opt_ancestorsTree) {
    for (var i = opt_ancestorsTree.length - 1; !e.propagationStopped_ && i >= 0;
         i--) {
      currentTarget = e.currentTarget = opt_ancestorsTree[i];
      rv = currentTarget.fireListeners(type, true, e) && rv;
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
  if (opt_ancestorsTree) {
    for (i = 0; !e.propagationStopped_ && i < opt_ancestorsTree.length; i++) {
      currentTarget = e.currentTarget = opt_ancestorsTree[i];
      rv = currentTarget.fireListeners(type, false, e) && rv;
    }
  }

  return rv;
};


/**
 * Finds the index of a matching goog.events.Listener in the given
 * listenerArray.
 * @param {!Array.<!goog.events.Listener>} listenerArray Array of listener.
 * @param {!Function} listener The listener function.
 * @param {boolean=} opt_useCapture The capture flag for the listener.
 * @param {Object=} opt_listenerScope The listener scope.
 * @return {number} The index of the matching listener within the
 *     listenerArray.
 * @private
 */
rdm.local.EventTarget.findListenerIndex_ = function(
    listenerArray, listener, opt_useCapture, opt_listenerScope) {
  for (var i = 0; i < listenerArray.length; ++i) {
    var listenerObj = listenerArray[i];
    if (listenerObj.listener == listener &&
        listenerObj.capture == !!opt_useCapture &&
        listenerObj.handler == opt_listenerScope) {
      return i;
    }
  }
  return -1;
};
