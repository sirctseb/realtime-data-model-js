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

goog.provide('rdm.custom');
goog.require('rdm.GoogleDocProvider');
goog.require('rdm.CustomObject');

rdm.custom = {

  /**
   * Registers a user-defined type as a collaborative type. This must be called before {@code rdm.DocumentProvider.loadDocument}.
   */
  registerType: function(type, name) {
    // store local type info
    rdm.CustomObject.customTypes_[name] = {type: type, fields: {}, ids: []};
    // do realtime registration
    if(rdm.GoogleDocProvider.globallySetup_) {
      gapi.drive.realtime.custom.registerType(type, name);
    }
  },

  /**
   * Adds a custom collaborative property to the type. For example:
   * rdm.custom.collaborativeField(MyClass, 'name');
   * Instances of MyClass created by rdm.Model.create will have a field that can be read and assigned to
   * like a regular field, but the value will automatically be saved and sent to other collaborators.
   */
  collaborativeField: function(type, name) {
    if(rdm.GoogleDocProvider.globallySetup_) {
      // add realtime collaborative field to type prototype
      type.prototype[name] = gapi.drive.realtime.custom.collaborativeField(name);
    }

    // store field on local custom object info to be added when local model creates object
    rdm.CustomObject.customTypes_[rdm.CustomObject.customTypeName_(type)].fields[name] = 
      rdm.custom.localCollaborativeField_(name);
  },

  localCollaborativeField_: function(name) {
    // stores the actual value of the property
    return {
      configurable: false,
      enumerable: true,
      get: function () {
        return this.backingFields_[name];
        // this.H();
        // var b=mx(this),c=b.b,e=oe(b,this);
        // if(null==e)
        //   throw Error();
        // return de(b,c.get(e,a))
      },
      set: function (b) {
        // create event
        var event = new rdm.ValueChangedEvent(this, name, b, this.backingFields_[name] || null);
        // emit event
        this.emitEventsAndChanged_([event]);

        // this.H();
        // var c=mx(this),e=c.b,f=oe(c,this);
        // if(null==f)
        //   throw Error();
        // b=oe(c,b);
        // e.put(f,a,b);
      }
    };
  },


  /**
   * Sets the initializer function for the given type.
   * The type must have already been registered with a call to registerType.
   */
  setInitializer: function(type, initializerFn) {
    // set realtime initializer
    if(rdm.GoogleDocProvider.globallySetup_) {
      gapi.drive.realtime.custom.setInitializer(type, initializerFn);
    }

    // store initializer in local custom object info
    for(var name in rdm.CustomObject.customTypes_) {
      if(rdm.CustomObject.customTypes_[name].type === type) {
        rdm.CustomObject.customTypes_[name].initializerFn = initializerFn;
        return;
      }
    }
  },

  /**
   * Sets the onLoaded function for the given type.
   * The type must have already been registered with a call to registerType.
   */
  setOnLoaded: function(type, opt_onLoadedFn) {
    // set realtime loaded function
    if(rdm.GoogleDocProvider.globallySetup_) {
      gapi.drive.realtime.custom.setOnLoaded(type, opt_onLoadedFn);
    }

    // store loaded function in local custom object info
    for(var name in rdm.CustomObject.customTypes_) {
      if(rdm.CustomObject.customTypes_[name].type === type) {
        rdm.CustomObject.customTypes_[name].onLoadedFn = opt_onLoadedFn;
        return;
      }
    }
  },

  /**
   * Returns true if obj is a custom collaborative object, otherwise false.
   */
  isCustomObject: function(obj) {
    return (rdm.custom.isCustomObject_(obj) ||
      (rdm.GoogleDocProvider.globallySetup_ &&
      gapi.drive.realtime.custom.isCustomObject(obj)));
  },

  isCustomObject_: function(obj) {
    // return obj instanceof rdm.CustomObject;
    return goog.array.contains(rdm.CustomObject.instances_, obj);
  },

  /**
   * Returns the id of the given custom object.
   */
  getId: function(obj) {
    if(rdm.custom.isCustomObject_(obj)) {
      return rdm.custom.getLocalId_(obj);
    } else if(rdm.GoogleDocProvider.globallySetup_ &&
      gapi.drive.realtime.custom.isCustomObject(obj)) {
      return gapi.drive.realtime.custom.getId(obj);
    } else {
      throw 'Object ' + obj + ' is not a custom object';
    }
  },

  getLocalId_: function(obj) {
    return obj.id_;
  },


  /**
   * Maps from object ids to the models that created the objects
   * @private
   */
  customObjectModels_: {},

  /**
   * Returns the model for the given custom object.
   */
  getModel: function(obj) {
    if(rdm.custom.isCustomObject_(obj)) {
      return rdm.custom.getLocalModel_(obj);
    } else if(rdm.GoogleDocProvider.globallySetup_ &&
      gapi.drive.realtime.custom.isCustomObject(obj)) {
      return gapi.drive.realtime.custom.getModel(obj);
    } else {
      throw 'Object ' + obj + ' is not a custom object';
    }
  },

  getLocalModel_: function(obj) {
    return rdm.custom.customObjectModels_['' + rdm.custom.getLocalId_(obj)];
  }
};
