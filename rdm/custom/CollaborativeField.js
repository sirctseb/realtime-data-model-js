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

goog.provide('rdm.custom.CollaborativeField_');
goog.require('rdm.local.LocalValueChangedEvent');

// var rdm.custom = {};
rdm.custom.CollaborativeField_ = function(name) {
  // stores the actual value of the property
  var backingfield;
  this.b = {
    configurable: false,
    enumerable: true,
    get: function () {
      return backingfield;
      // this.H();
      // var b=mx(this),c=b.b,e=oe(b,this);
      // if(null==e)
      //   throw Error();
      // return de(b,c.get(e,a))
    },
    set: function (b) {
      // create event
      var event = new rdm.local.LocalValueChangedEvent(this, name, b, this.backingFields_[name] || null);
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
};
