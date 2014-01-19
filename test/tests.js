initializeModel = function(model) {
  console.log('initializeModel called');
  model.getRoot().set('text', model.createString('Hello Realtime World!'));
  model.getRoot().set('list', model.createList());
  model.getRoot().set('map', model.createMap());
  model.getRoot().set('book', model.create('Book'));
  console.log('initializeModel ending');
};

onFileLoaded = function(doc) {
  console.log('onFileLoaded called');
  module('Undo');
  test("start undo state", function() {
    equal(doc.getModel().canUndo, false);
    equal(doc.getModel().canRedo, false);
  });
  test('undo state after change', function() {
    doc.getModel().getRoot().get('text').setText('redid');
    equal(doc.getModel().canUndo, true);
    equal(doc.getModel().canRedo, false);
  });
  test('undo state after undo', function() {
    doc.getModel().undo();
    equal(doc.getModel().canUndo, false);
    equal(doc.getModel().canRedo, true);
  });
  test('string state after undo', function() {
    equal(doc.getModel().getRoot().get('text').getText(), 'Hello Realtime World!');
  });
  test('string state after redo and event/model state matching', function() {
    expect(5);
    var undo = function(event) {
      // test that event properties match model
      equal(doc.getModel().canUndo, event.canUndo);
      equal(doc.getModel().canRedo, event.canRedo);
      // test that undo/redo state is what we equal
      equal(doc.getModel().canUndo, true);
      equal(doc.getModel().canRedo, false);
      doc.getModel().removeEventListener(rdm.EventType.UNDO_REDO_STATE_CHANGED, undo);
    };
    doc.getModel().addEventListener(rdm.EventType.UNDO_REDO_STATE_CHANGED, undo);
    doc.getModel().redo();
    equal(doc.getModel().getRoot().get('text').getText(), 'redid');
    doc.getModel().undo();
  });

  var string = doc.getModel().getRoot().get('text');
  module('CollaborativeString', {
    setup: function() {
      console.log('setting up string');
      string.setText('unittest');
    }});
  test('get length', function() {
    console.log('get length');
    equal(string.length, 8);
  });
  test('append(String text)', function() {
    console.log('append string test');
    string.append(' append');
    equal(string.getText(), 'unittest append');
  });
  test('get text', function() {
    console.log('get text');
    equal(string.getText(), 'unittest');
  });
  test('insertString(int index, String text)', function() {
    console.log('insert string');
    string.insertString(4, ' append ');
    equal(string.getText(), 'unit append test');
  });
  test('removeRange(int startIndex, int endIndex)', function() {
    string.removeRange(4, 6);
    equal(string.getText(), 'unitst');
  });
  test('set text(String text)', function() {
    string.setText('newValue');
    equal(string.getText(), 'newValue');
  });
  test('onTextInserted', function() {
    expect(2);
    var ssInsert = function(event) {
      equal(event.index, 4);
      equal(event.text, ' append ');
      string.removeEventListener(rdm.EventType.TEXT_INSERTED, ssInsert);
      string.removeEventListener(rdm.EventType.TEXT_DELETED, ssDelete);
    };
    var ssDelete = function(event) {
      fail("delete should not be call");
    };//, count: 0));
    string.addEventListener(rdm.EventType.TEXT_INSERTED, ssInsert);
    string.addEventListener(rdm.EventType.TEXT_DELETED, ssDelete);
    string.insertString(4, ' append ');
  });
  test('onTextDeleted', function() {
    expect(2);
    var ssInsert = function(event) {
      fail("insert should not be call");
    }
    var ssDelete = function(event) {
      equal(event.index, 4);
      equal(event.text, 'te');
      string.removeEventListener(rdm.EventType.TEXT_INSERTED, ssInsert);
      string.removeEventListener(rdm.EventType.TEXT_DELETED, ssDelete);
    };
    string.addEventListener(rdm.EventType.TEXT_INSERTED, ssInsert);
    string.addEventListener(rdm.EventType.TEXT_DELETED, ssDelete);
    string.removeRange(4, 6);
  });

  var list = doc.getModel().getRoot().get('list');
  module('CollaborativeList', {
    setup: function() {
      list.clear();
      list.push('s1');
    }});
  test('get length', function() {
    equal(list.length, 1);
  });
  test('operator [](int index)', function() {
    equal(list.get(0), 's1');
    // TODO how to test failures in QUnit?
    // equal(function() { return list.get(-1); }, 'throws');
    // equal(function() { return list.get(1); }, 'throws');
  });
  test('operator []=(int index, E value)', function() {
    list.set(0, 'new s1');
    equal(list.get(0), 'new s1');
  });
  test('clear()', function() {
    list.clear();
    equal(list.length, 0);
  });
  test('insert(int index, E value)', function() {
    list.insert(0, 's0');
    equal(list.length, 2);
    equal(list.get(0), 's0');
    equal(list.get(1), 's1');
  });
  test('push(E value)', function() {
    equal(list.push('s2'), 2);
    equal(list.length, 2);
    equal(list.get(0), 's1');
    equal(list.get(1), 's2');
  });
  test('remove(int index)', function() {
    list.remove(0);
    equal(list.length, 0);
  });
  test('onValuesAdded', function() {
    expect(2);
    var ss = function(event) {
      equal(event.index, 1);
      deepEqual(event.values, ['s2']);
      list.removeEventListener(rdm.EventType.VALUES_ADDED, ss);
    };
    list.addEventListener(rdm.EventType.VALUES_ADDED, ss);
    list.push('s2');
  });
  test('onValuesRemoved', function() {
    expect(2);
    var ss = function(event) {
      equal(event.index, 0);
      deepEqual(event.values, ['s1']);
      list.removeEventListener(rdm.EventType.VALUES_REMOVED, ss);
    };
    list.addEventListener(rdm.EventType.VALUES_REMOVED, ss);
    list.clear();
  });
  test('onValuesSet', function() {
    expect(3);
    var ss = function(event) {
      equal(event.index, 0);
      deepEqual(event.oldValues, ['s1']);
      deepEqual(event.newValues, ['s2']);
      list.removeEventListener(rdm.EventType.VALUES_SET, ss);
    };
    list.addEventListener(rdm.EventType.VALUES_SET, ss);
    list.set(0, 's2');
  });
  test('propagation', function() {
    expect(1);
    var ss = function(event) {
      equal(event.events[0].type == rdm.EventType.VALUES_ADDED, true);
    };
    doc.getModel().getRoot().addEventListener(rdm.EventType.OBJECT_CHANGED, ss);

    list.push('value');

    doc.getModel().getRoot().removeEventListener(rdm.EventType.OBJECT_CHANGED, ss);
  });

  var map = doc.getModel().getRoot().get('map');
  module('CollaborativeMap', {
    setup: function() {
      map.clear();
      map.set('key1',4);
    }});
  test('absent key', function() {
    strictEqual(map.get('absent'), null);
  });
  test('null value', function() {
    strictEqual(map.get('nullkey'), null);
    equal(map.has('nullkey'), false);
    map.set('nullkey', null);
    strictEqual(map.get('nullkey'), null);
    equal(map.has('nullkey'), false);
  });
  test('size with null', function() {
    equal(map.size, 1);
    map.set('nullkey', null);
    equal(map.size, 1);
  })
  test('operator [](String key)', function() {
    equal(map.get('key1'), 4);
    equal(map.size, 1);
  });
  test('set(key, value)', function() {
    strictEqual(map.set('key2',5), undefined);
    equal(map.get('key2'), 5);
  });
  test('delete', function() {
    map.delete('key1');
    equal(map.size, 0);
    equal(map.get('key1'), null);
  });
  test('clear', function() {
    map.clear();
    equal(map.size, 0);
  });
  test('onValueChanged', function() {
    expect(3);
    var ssChanged = function(event) {
      equal(event.property, 'key1');
      equal(event.newValue, 5);
      equal(event.oldValue, 4);
      map.removeEventListener(rdm.EventType.VALUE_CHANGED, ssChanged);
    };
    map.addEventListener(rdm.EventType.VALUE_CHANGED, ssChanged);
    map.set('key1',5);
  });
  test('onValueChanged add', function() {
    expect(3);
    var ssAdd = function(event) {
      equal(event.property, 'prop');
      equal(event.newValue, 'newVal');
      equal(event.oldValue, null);
      map.removeEventListener(rdm.EventType.VALUE_CHANGED, ssAdd);
    };
    map.addEventListener(rdm.EventType.VALUE_CHANGED, ssAdd);
    map.set('prop','newVal');
  });
  test('onValueChanged remove', function() {
    expect(3);
    var ssRemove = function(event) {
      equal(event.property, 'key1');
      equal(event.oldValue, 4);
      equal(event.newValue, null);
      map.removeEventListener(rdm.EventType.VALUE_CHANGED, ssRemove);
    };
    map.addEventListener(rdm.EventType.VALUE_CHANGED, ssRemove);
    map.delete('key1');
  });
  test('onValueChanged clear', function() {
    expect(2);
    map.set('key2','val2');
    var ssClear = function(event) {
      equal(event.newValue, null);
    }; //, count: 2));
    map.addEventListener(rdm.EventType.VALUE_CHANGED, ssClear);
    map.clear();
    map.removeEventListener(rdm.EventType.VALUE_CHANGED, ssClear);
  });
  test('map length on null assignment', function() {
    // TODO this is different than native maps. but that is a rt problem, not rdm.
    equal(map.size, 1);
    map.set('key1',null);
    equal(map.size, 0);
  });

  module('RealtimeIndexReference');
  // TODO are references ever removed?
  test('RealtimeString Reference Value', function() {
    string.setText("aaaaaaaaaa");
    var ref = string.registerReference(5, false);
    equal(ref.index, 5);
    string.insertString(2, "x");
    equal(ref.index, 6);
    doc.getModel().undo();
    equal(ref.index, 5);
    string.insertString(8, "x");
    equal(ref.index, 5);
    string.removeRange(0, 2);
    equal(ref.index, 3);
    string.removeRange(2, 4);
    equal(ref.index, 2);
  });
  test('RealtimeString Delete Reference', function() {
    var ref = string.registerReference(5, true);
    equal(ref.index, 5);
    string.removeRange(4, 6);
    equal(ref.index, -1);
  });
  test('RealtimeList Reference Value', function() {
    list.clear();
    list.pushAll([1,2,3,4,5,6,7,8,9,10,11,12]);
    var ref = list.registerReference(5, false);
    equal(ref.index, 5);
    list.insert(2, 9);
    equal(ref.index, 6);
    doc.getModel().undo();
    equal(ref.index, 5);
    list.insert(8, 9);
    equal(ref.index, 5);
    list.removeRange(0, 2);
    equal(ref.index, 3);
    list.removeRange(2, 4);
    equal(ref.index, 2);
  });
  test('RealtimeList Delete Reference', function() {
    var ref = list.registerReference(5, true);
    equal(ref.index, 5);
    list.removeRange(4, 6);
    equal(ref.index, -1);
  });
  test('RealtimeString Reference Events', function() {
    expect(3);
    string.setText("aaaaaaaaaa");
    var ref = string.registerReference(5, true);
    var ssRef = function(event) {
      equal(event.oldIndex, 5);
      equal(event.newIndex, 7);
      equal(ref.index, 7);
      ref.removeEventListener(rdm.EventType.REFERENCE_SHIFTED,ssRef);
    };
    ref.addEventListener(rdm.EventType.REFERENCE_SHIFTED,ssRef);
    string.insertString(0, "xx");
  });
  test('Assign index', function() {
    string.setText("aaaaaaaaaa");
    var ref = string.registerReference(5, true);
    equal(ref.index, 5);
    ref.index = 7;
    equal(ref.index, 7);
    string.insertString(0, "xx");
    equal(ref.index, 9);
  });
  test('resurrect index', function() {
    var ref = string.registerReference(2, true);
    string.removeRange(1,3);
    equal(ref.index, -1);
    ref.index = 3;
    equal(ref.index, 3);
    string.insertString(0, "x");
    equal(ref.index, 4);
  });
  module('Events');
  test('Object Change Bubbling', function() {
    var order = '';
    var rootCapture = function(e) {
      order = order + 'rootCapture';
    }
    var rootBubble = function(e) {
      order = order + 'rootBubble';
    }
    var stringEvent = function(e) {
      order = order + 'stringEvent';
    }
    string.addEventListener(rdm.EventType.OBJECT_CHANGED, stringEvent);
    doc.getModel().getRoot().addEventListener(rdm.EventType.OBJECT_CHANGED, rootBubble);
    doc.getModel().getRoot().addEventListener(rdm.EventType.OBJECT_CHANGED, rootCapture, true);
    string.insertString(0, 'x');
    equal(order, 'rootCapturestringEventrootBubble');
  });

  module('Custom');
  test('Book is custom object', function() {
    equal(gapi.drive.realtime.custom.isCustomObject(doc.getModel().getRoot().get('book')), true);
    equal(gapi.drive.realtime.custom.isCustomObject(doc.getModel().getRoot().get('text')), false);
  });
  test('Set title', function() {
    equal(doc.getModel().getRoot().get('book').title, null);
    doc.getModel().getRoot().get('book').addEventListener(rdm.EventType.OBJECT_CHANGED, function(e) {
      console.log(e);
    });
    doc.getModel().getRoot().get('book').addEventListener(rdm.EventType.VALUE_CHANGED, function(e) {
      console.log(e.property + ' changed from ' + e.oldValue + ' to ' + e.newValue);
    });
    doc.getModel().getRoot().get('book')['title'] = 'title';
    equal(doc.getModel().getRoot().get('book').title, 'title');
  });

  module('Multiple entries');
  test('Twice in one map', function() {
    expect(2);
    var str = doc.getModel().createString('dup');
    doc.getModel().getRoot().get('map').set('duplicate1', str);
    doc.getModel().getRoot().get('map').set('duplicate2', str);
    equal(doc.getModel().getRoot().get('map').get('duplicate1'),
          doc.getModel().getRoot().get('map').get('duplicate2'));
    var ssObjChanged = function(e) {
      equal(e.events[0].type, 'text_inserted');
      doc.getModel().getRoot().get('map').removeEventListener(
        rdm.EventType.OBJECT_CHANGED,
        ssObjChanged);
    };
    doc.getModel().getRoot().get('map').addEventListener(rdm.EventType.OBJECT_CHANGED, ssObjChanged);
    doc.getModel().getRoot().get('map').get('duplicate1').append('whatever');
  });
  test('Once in two maps each', function() {
    expect(4);
    var str = doc.getModel().createString('dup');
    doc.getModel().getRoot().get('map').set('dupmap1', doc.getModel().createMap());
    doc.getModel().getRoot().get('map').set('dupmap2', doc.getModel().createMap());
    doc.getModel().getRoot().get('map').get('dupmap1').set('str', str);
    doc.getModel().getRoot().get('map').get('dupmap2').set('str', str);
    equal(doc.getModel().getRoot().get('map').get('dupmap1').get('str'),
          doc.getModel().getRoot().get('map').get('dupmap2').get('str'));
    var ssObjChanged1 = function(e) {
      console.log('dupmap1 handler');
      equal(e.events[0].type, 'text_inserted');
    };
    doc.getModel().getRoot().get('map').get('dupmap1').addEventListener(
      rdm.EventType.OBJECT_CHANGED, ssObjChanged1);
    var ssObjChanged2 = function(e) {
      console.log('dupmap2 handler');
      equal(e.events[0].type, 'text_inserted');
    };
    doc.getModel().getRoot().get('map').get('dupmap2').addEventListener(
      rdm.EventType.OBJECT_CHANGED, ssObjChanged2);
    var ssRootChanged = function(e) {
      console.log('root handler');
      equal(e.events[0].type, 'text_inserted');
    };
    doc.getModel().getRoot().get('map').addEventListener(
      rdm.EventType.OBJECT_CHANGED, ssRootChanged);
    doc.getModel().getRoot().get('map').get('dupmap2').get('str').append('hello');
    doc.getModel().getRoot().get('map').get('dupmap2').removeEventListener(
      rdm.EventType.OBJECT_CHANGED,
      ssObjChanged2);
    doc.getModel().getRoot().get('map').get('dupmap1').removeEventListener(
      rdm.EventType.OBJECT_CHANGED,
      ssObjChanged1);
    doc.getModel().getRoot().get('map').removeEventListener(
      rdm.EventType.OBJECT_CHANGED,
      ssRootChanged);
  });
  test('String in map and sub map', function() {
    var str = doc.getModel().createString('dup');
    var subsubmap = doc.getModel().createMap();
    var submap = doc.getModel().createMap();
    var topmap = doc.getModel().createMap();

    doc.getModel().getRoot().get('map').set('mapwithsub', topmap);
    doc.getModel().getRoot().get('map').get('mapwithsub').set('submap', submap);
    doc.getModel().getRoot().get('map').get('mapwithsub').get('submap').set('subsubmap', subsubmap);

    doc.getModel().getRoot().get('map').get('mapwithsub').set('str', str);
    doc.getModel().getRoot().get('map').get('mapwithsub').get('submap').get('subsubmap').set('str', str);

    var ssMapChanged = function(e) {
      console.log('Top map change');
      equal(e.events[0].type, 'text_inserted');
    };
    doc.getModel().getRoot().get('map').get('mapwithsub').addEventListener(
      rdm.EventType.OBJECT_CHANGED,
      ssMapChanged);
    var ssSubMapChanged = function(e) {
      console.log('Sub map change');
      equal(e.events[0].type, 'text_inserted');
    };
    doc.getModel().getRoot().get('map').get('mapwithsub').get('submap').addEventListener(
      rdm.EventType.OBJECT_CHANGED,
      ssSubMapChanged);
    var ssSubSubMapChanged = function(e) {
      console.log('Sub sub map change');
      equal(e.events[0].type, 'text_inserted');
    };
    doc.getModel().getRoot().get('map').get('mapwithsub').get('submap').get('subsubmap').addEventListener(
      rdm.EventType.OBJECT_CHANGED,
      ssSubSubMapChanged);
    var ssStringChanged = function(e) {
      console.log('String change');
      equal(e.events[0].type, 'text_inserted');
    };
    doc.getModel().getRoot().get('map').get('mapwithsub').get('str').addEventListener(
      rdm.EventType.OBJECT_CHANGED,
      ssStringChanged);
    str.append('something');
    doc.getModel().getRoot().get('map').get('mapwithsub').removeEventListener(
      rdm.EventType.OBJECT_CHANGED,
      ssMapChanged);
    doc.getModel().getRoot().get('map').get('mapwithsub').get('submap').removeEventListener(
      rdm.EventType.OBJECT_CHANGED,
      ssSubMapChanged);
    doc.getModel().getRoot().get('map').get('mapwithsub').get('submap').get('subsubmap').removeEventListener(
      rdm.EventType.OBJECT_CHANGED,
      ssSubSubMapChanged);
    doc.getModel().getRoot().get('map').get('mapwithsub').get('str').removeEventListener(
      rdm.EventType.OBJECT_CHANGED,
      ssStringChanged);
  });
  test('loop length 2', function() {
    var map1 = doc.getModel().createMap();
    var map2 = doc.getModel().createMap();
    doc.getModel().getRoot().get('map').set('loop', map1);
    map1.set('map2', map2);
    map2.set('map1', map1);
    map1.set('map2b', map2);
    var ssMap1 = function(e) {
      console.log('map1 change');
      equal(e.events[0].type, 'value_changed');
    };
    map1.addEventListener(rdm.EventType.OBJECT_CHANGED, ssMap1);
    var ssMap2 = function(e) {
      console.log('map2 change');
      equal(e.events[0].type, 'value_changed');
    };
    map2.addEventListener(rdm.EventType.OBJECT_CHANGED, ssMap2);
    var ssMap = function(e) {
      console.log('map change');
      equal(e.events[0].type, 'value_changed');
    };
    doc.getModel().getRoot().get('map').addEventListener(rdm.EventType.OBJECT_CHANGED, ssMap);

    map1.set('text', 'text value');

    doc.getModel().getRoot().get('map').addEventListener(rdm.EventType.OBJECT_CHANGED, ssMap);
    map1.removeEventListener(rdm.EventType.OBJECT_CHANGED, ssMap1);
    map2.removeEventListener(rdm.EventType.OBJECT_CHANGED, ssMap2);
  });
  module('Weird');
  test('Map in self', function() {
    doc.getModel().getRoot().set('self', doc.getModel().getRoot());
    equal(doc.getModel().getRoot(), doc.getModel().getRoot().get('self'));
    var rootChanged = function(e) {
      equal(e.events[0].type, 'value_changed');
    };
    doc.getModel().getRoot().addEventListener(
      rdm.EventType.OBJECT_CHANGED,
      rootChanged);
    doc.getModel().getRoot().get('self').set('key', 'val');
    doc.getModel().getRoot().get('self').removeEventListener(rdm.EventType.OBJECT_CHANGED, rootChanged);
  });
};

/**
 * Options for the Realtime loader.
 */
realtimeOptions = {
   /**
  * Client ID from the APIs Console.
  */
  'clientId': '1066816720974',

   /**
  * The ID of the button to click to authorize. Must be a DOM element ID.
  */
   'authButtonElementId': 'authorizeButton',

   /**
  * Function to be called when a Realtime model is first created.
  */
   'initializeModel': initializeModel,

   /**
  * Autocreate files right after auth automatically.
  */
   'autoCreate': true,

   /**
  * Autocreate files right after auth automatically.
  */
   'defaultTitle': "New Realtime Quickstart File",

   /**
  * Function to be called every time a Realtime file is loaded.
  */
   'onFileLoaded': onFileLoaded
};
