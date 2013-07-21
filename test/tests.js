initializeModel = function(model) {
  model.getRoot().get('text') = model.createString('Hello Realtime World!');
  model.getRoot().get('list') = model.createList();
  model.getRoot().get('map') = model.createMap();
}

onFileLoaded = function(doc) {
  module('Undo');
  test("start undo state", function() {
    expect(doc.getModel().canUndo, false);
    expect(doc.getModel().canRedo, false);
  });
  test('undo state after change', function() {
    doc.getModel().getRoot().get('text').text = 'redid';
    expect(doc.getModel().canUndo, true);
    expect(doc.getModel().canRedo, false);
  });
  test('undo state after undo', function() {
    doc.getModel().undo();
    expect(doc.getModel().canUndo, false);
    expect(doc.getModel().canRedo, true);
  });
  test('string state after undo', function() {
    expect(doc.getModel().getRoot().get('text').text, 'Hello Realtime World!');
  });
  test('string state after redo and event/model state matching', function() {
    undo = function(event) {
      // test that event properties match model
      expect(doc.getModel().canUndo, event.canUndo);
      expect(doc.getModel().canRedo, event.canRedo);
      // test that undo/redo state is what we expect
      expect(doc.getModel().canUndo, true);
      expect(doc.getModel().canRedo, false);
      doc.getModel().removeEventListener(gapi.drive.realtime.EventType.UNDO_REDO_STATE_CHANGED, undo);
    };
    doc.getModel().addEventListener(gapi.drive.realtime.EventType.UNDO_REDO_STATE_CHANGED, undo);
    doc.getModel().redo();
    expect(doc.getModel().getRoot().get('text').getText(), 'redid');
    doc.getModel().undo();
  });

  module('CollaborativeString');
  var string = doc.getModel().getRoot().get('text');
  setUp(function() {
    string.setText('unittest');
  });
  test('get length', function() {
    expect(string.length, 8);
  });
  test('append(String text)', function() {
    string.append(' append');
    expect(string.text, 'unittest append');
  });
  test('get text', function() {
    expect(string.text, 'unittest');
  });
  test('insertString(int index, String text)', function() {
    string.insertString(4, ' append ');
    expect(string.text, 'unit append test');
  });
  test('removeRange(int startIndex, int endIndex)', function() {
    string.removeRange(4, 6);
    expect(string.text, 'unitst');
  });
  test('set text(String text)', function() {
    string.text = 'newValue';
    expect(string.text, 'newValue');
  });
  test('onTextInserted', function() {
    var ssInsert = function(event) {
      expect(e.index, 4);
      expect(e.text, ' append ');
      string.removeEventListener(gapi.realtime.EventType.TEXT_INSERTED, ssInsert);
      string.removeEventListener(gapi.realtime.EventType.TEXT_DELETED, ssDelete);
    };
    var ssDelete = function(event) {
      fail("delete should not be call");
    };//, count: 0));
    string.addEventListener(gapi.realtime.EventType.TEXT_INSERTED, ssInsert);
    string.addEventListener(gapi.realtime.EventType.TEXT_DELETED, ssDelete);
    string.insertString(4, ' append ');
  });
  test('onTextDeleted', function() {
    var ssInsert = function(event) {
      fail("insert should not be call");
    }
    var ssDelete = function(event) {
      expect(e.index, 4);
      expect(e.text, 'te');
      string.removeEventListener(gapi.realtime.EventType.TEXT_INSERTED, ssInsert);
      string.removeEventListener(gapi.realtime.EventType.TEXT_DELETED, ssDelete);
    };
      string.addEventListener(gapi.realtime.EventType.TEXT_INSERTED, ssInsert);
      string.addEventListener(gapi.realtime.EventType.TEXT_DELETED, ssDelete);
    string.removeRange(4, 6);
  });

  module('CollaborativeList');
  var list = doc.getModel().getRoot().get('list');
  setUp(function() {
    list.clear();
    list.push('s1');
  });
  test('get length', function() {
    expect(list.length, 1);
  });
  test('operator [](int index)', function() {
    expect(list[0], 's1');
    expect(function() { return list[-1]; }, 'throws');
    expect(function() { return list[1]; }, 'throws');
  });
  test('operator []=(int index, E value)', function() {
    list[0] = 'new s1';
    expect(list[0], 'new s1');
  });
  test('clear()', function() {
    list.clear();
    expect(list.length, 0);
  });
  test('insert(int index, E value)', function() {
    list.insert(0, 's0');
    expect(list.length, 2);
    expect(list[0], 's0');
    expect(list[1], 's1');
  });
  test('push(E value)', function() {
    expect(list.push('s2'), 2);
    expect(list.length, 2);
    expect(list[0], 's1');
    expect(list[1], 's2');
  });
  test('remove(int index)', function() {
    list.remove(0);
    expect(list.length, 0);
  });
  test('onValuesAdded', function() {
    var ss = function(event) {
      expect(e.index, 1);
      expect(e.values, ['s2']);
      list.removeEventListener(gapi.realtime.EventType.VALUES_ADDED);
    };
    list.addEventListener(gapi.realtime.EventType.VALUES_ADDED);
    list.push('s2');
  });
  test('onValuesRemoved', function() {
    var ss = function(event) {
      expect(e.index, 0);
      expect(e.values, ['s1']);
      list.removeEventListener(gapi.realtime.EventType.VALUES_REMOVED);
    };
    list.addEventListener(gapi.realtime.EventType.VALUES_REMOVED);
    list.clear();
  });
  test('onValuesSet', function() {
    var ss = function(event) {
      expect(e.index, 0);
      expect(e.oldValues, ['s1']);
      expect(e.newValues, ['s2']);
      list.removeEventListener(gapi.realtime.EventType.VALUES_SET);
    };
    list.addEventListener(gapi.realtime.EventType.VALUES_SET);
    list[0] = 's2';
  });

  module('CollaborativeMap');
  var map = doc.getModel().getRoot().get('map');
  setUp(function() {
    map.clear();
    map.set('key1',4);
  });
  test('operator [](String key)', function() {
    expect(map.get('key1'), 4);
    expect(map.length, 1);
  });
  test('operator []=(String key, E value)', function() {
    map.set('key2',5);
    expect(map.get('key2'), 5);
  });
  test('remove', function() {
    map.remove('key1');
    expect(map.length, 0);
    expect(map.get('key1'), null);
  });
  test('clear', function() {
    map.clear();
    expect(map.length, 0);
  });
  test('addAll', function() {
    map.addAll({
      'key2': 5,
      'key3': 6
    });
    expect(map.length, 3);
    expect(map.get('key2'), 5);
    expect(map.get('key3'), 6);
  });
  test('onValueChanged', function() {
    var ssChanged = function(event) {
      expect(e.property, 'key1');
      expect(e.newValue, 5);
      expect(e.oldValue, 4);
      map.removeEventListener(gapi.realtime.EventType.VALUE_CHANGED, ssChanged);
    };
    map.addEventListener(gapi.realtime.EventType.VALUE_CHANGED, ssChanged);
    map.set('key1',5);
  });
  test('onValueChanged add', function() {
    var ssAdd = function(event) {
      expect(e.property, 'prop');
      expect(e.newValue, 'newVal');
      expect(e.oldValue, null);
      map.removeEventListener(gapi.realtime.EventType.VALUE_CHANGED, ssAdd);
    };
    map.addEventListener(gapi.realtime.EventType.VALUE_CHANGED, ssAdd);
    map.set('prop','newVal');
  });
  test('onValueChanged remove', function() {
    var ssRemove = function(event) {
      expect(e.property, 'key1');
      expect(e.oldValue, 4);
      expect(e.newValue, null);
      map.removeEventListener(gapi.realtime.EventType.VALUE_CHANGED, ssRemove);
    };
    map.addEventListener(gapi.realtime.EventType.VALUE_CHANGED, ssRemove);
    map.remove('key1');
  });
  test('onValueChanged clear', function() {
    map.set('key2','val2');
    var ssClear = function(event) {
      expect(e.newValue, null);
    }; //, count: 2));
    map.addEventListener(gapi.realtime.EventType.VALUE_CHANGED, ssClear);
    map.clear();
    map.removeEventListener(gapi.realtime.EventType.VALUE_CHANGED, ssClear);
  });
  test('map length on null assignment', function() {
    // TODO this is different than native maps. but that is a rt problem, not rdm.
    expect(map.length, 1);
    map.set('key1',null);
    expect(map.length, 0);
  });

  module('RealtimeIndexReference');
  var string = doc.getModel().getRoot().get('text');
  var list = doc.getModel().getRoot().get('list');
  // TODO are references ever removed?
  test('RealtimeString Reference Value', function() {
    string.setText("aaaaaaaaaa");
    var ref = string.registerReference(5, false);
    expect(ref.index, 5);
    string.insertString(2, "x");
    expect(ref.index, 6);
    doc.getModel().undo();
    expect(ref.index, 5);
    string.insertString(8, "x");
    expect(ref.index, 5);
    string.removeRange(0, 2);
    expect(ref.index, 3);
    string.removeRange(2, 4);
    expect(ref.index, 2);
  });
  test('RealtimeString Delete Reference', function() {
    var ref = string.registerReference(5, true);
    expect(ref.index, 5);
    string.removeRange(4, 6);
    expect(ref.index, -1);
  });
  test('RealtimeList Reference Value', function() {
    list.clear();
    list.pushAll([1,2,3,4,5,6,7,8,9,10,11,12]);
    var ref = list.registerReference(5, false);
    expect(ref.index, 5);
    list.insert(2, 9);
    expect(ref.index, 6);
    doc.getModel().undo();
    expect(ref.index, 5);
    list.insert(8, 9);
    expect(ref.index, 5);
    list.removeRange(0, 2);
    expect(ref.index, 3);
    list.removeRange(2, 4);
    expect(ref.index, 2);
  });
  test('RealtimeList Delete Reference', function() {
    var ref = list.registerReference(5, true);
    expect(ref.index, 5);
    list.removeRange(4, 6);
    expect(ref.index, -1);
  });
  test('RealtimeString Reference Events', function() {
    string.setText("aaaaaaaaaa");
    var ref = string.registerReference(5, true);
    var ssRef = function(event) {
      expect(event.oldIndex, 5);
      expect(event.newIndex, 7);
      expect(ref.index, 7);
    };
    string.addEventListener(gapi.realtime.EventType.REFERENCE_SHIFTED);
    string.insertString(0, "xx");
  });
}

/**
 * Options for the Realtime loader.
 */
realtimeOptions = {
   /**
  * Client ID from the APIs Console.
  */
  'clientId': 'INSERT YOUR CLIENT ID HERE',

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

var realtimeLoader = new rtclient.RealtimeLoader(realtimeOptions);
realtimeLoader.start();