initializeModel(model) {
  model.getRoot().get('text') = model.createString('Hello Realtime World!');
  model.getRoot().get('list') = model.createList();
  model.getRoot().get('map') = model.createMap();
}

onFileLoaded(doc) {
  group('Undo', () {
    test("start undo state", () {
      expect(doc.getModel().canUndo, false);
      expect(doc.getModel().canRedo, false);
    });
    test('undo state after change', () {
      doc.getModel().getRoot().get('text').text = 'redid';
      expect(doc.getModel().canUndo, true);
      expect(doc.getModel().canRedo, false);
    });
    test('undo state after undo', () {
      doc.getModel().undo();
      expect(doc.getModel().canUndo, false);
      expect(doc.getModel().canRedo, true);
    });
    test('string state after undo', () {
      expect(doc.getModel().getRoot().get('text').text, 'Hello Realtime World!');
    });
    test('string state after redo and event/model state matching', () {
      undo = function(event) {
        // test that event properties match model
        expect(doc.getModel().canUndo, event.canUndo);
        expect(doc.getModel().canRedo, event.canRedo);
        // test that undo/redo state is what we expect
        expect(doc.getModel().canUndo, true);
        expect(doc.getModel().canRedo, false);
        doc.getModel().removeEventListener(gapi.drive.realtime.EventType.UNDO_REDO_STATE_CHANGED, undo);
      }));
      doc.getModel().addEventListener(gapi.drive.realtime.EventType.UNDO_REDO_STATE_CHANGED, undo);
      doc.getModel().redo();
      expect(doc.getModel().getRoot().get('text').getText(), 'redid');
      doc.getModel().undo();
    });
  });

  group('CollaborativeString', () {
    var string = doc.getModel().getRoot().get('text');
    setUp((){
      string.setText('unittest');
    });
    test('get length', () {
      expect(string.length, 8);
    });
    test('append(String text)', () {
      string.append(' append');
      expect(string.text, 'unittest append');
    });
    test('get text', () {
      expect(string.text, 'unittest');
    });
    test('insertString(int index, String text)', () {
      string.insertString(4, ' append ');
      expect(string.text, 'unit append test');
    });
    test('removeRange(int startIndex, int endIndex)', () {
      string.removeRange(4, 6);
      expect(string.text, 'unitst');
    });
    test('set text(String text)', () {
      string.text = 'newValue';
      expect(string.text, 'newValue');
    });
    test('onTextInserted', () {
      var ssInsert = function(event) {
        expect(e.index, 4);
        expect(e.text, ' append ');
        string.removeEventListener(gapi.realtime.EventType.TEXT_INSERTED, ssInsert);
        string.removeEventListener(gapi.realtime.EventType.TEXT_DELETED, ssDelete);
      };
      var ssDelete = function(event) {
        fail("delete should not be call");
      }, count: 0));
      string.addEventListener(gapi.realtime.EventType.TEXT_INSERTED, ssInsert);
      string.addEventListener(gapi.realtime.EventType.TEXT_DELETED, ssDelete);
      string.insertString(4, ' append ');
    });
    test('onTextDeleted', () {
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
  });

  group('CollaborativeList', () {
    var list = doc.getModel().getRoot().get('list');
    setUp((){
      list.clear();
      list.push('s1');
    });
    test('get length', () {
      expect(list.length, 1);
    });
    test('operator [](int index)', () {
      expect(list[0], 's1');
      expect(() => list[-1], throws);
      expect(() => list[1], throws);
    });
    test('operator []=(int index, E value)', () {
      list[0] = 'new s1';
      expect(list[0], 'new s1');
    });
    test('clear()', () {
      list.clear();
      expect(list.length, 0);
    });
    test('insert(int index, E value)', () {
      list.insert(0, 's0');
      expect(list.length, 2);
      expect(list[0], 's0');
      expect(list[1], 's1');
    });
    test('push(E value)', () {
      expect(list.push('s2'), 2);
      expect(list.length, 2);
      expect(list[0], 's1');
      expect(list[1], 's2');
    });
    test('remove(int index)', () {
      list.remove(0);
      expect(list.length, 0);
    });
    test('onValuesAdded', () {
      var ss = function(event) {
        expect(e.index, 1);
        expect(e.values, ['s2']);
        list.removeEventListener(gapi.realtime.EventType.VALUES_ADDED);
      };
        list.addEventListener(gapi.realtime.EventType.VALUES_ADDED);
      list.push('s2');
    });
    test('onValuesRemoved', () {
      var ss = function(event) {
        expect(e.index, 0);
        expect(e.values, ['s1']);
        list.removeEventListener(gapi.realtime.EventType.VALUES_REMOVED);
      };
        list.addEventListener(gapi.realtime.EventType.VALUES_REMOVED);
      list.clear();
    });
    test('onValuesSet', () {
      var ss = function(event) {
        expect(e.index, 0);
        expect(e.oldValues, ['s1']);
        expect(e.newValues, ['s2']);
        list.removeEventListener(gapi.realtime.EventType.VALUES_SET);
      };
        list.addEventListener(gapi.realtime.EventType.VALUES_SET);
      list[0] = 's2';
    });
  });
  group('CollaborativeMap', () {
    var map = doc.getModel().getRoot().get('map');
    setUp(() {
      map.clear();
      map.set('key1'] = 4;
    });
    test('operator [](String key)', () {
      expect(map.get('key1'), 4);
      expect(map.length, 1);
    });
    test('operator []=(String key, E value)', () {
      map.set('key2',5);
      expect(map.get('key2'), 5);
    });
    test('remove', () {
      map.remove('key1');
      expect(map.length, 0);
      expect(map.get('key1'), null);
    });
    test('clear', () {
      map.clear();
      expect(map.length, 0);
    });
    test('addAll', () {
      map.addAll({
        'key2': 5,
        'key3': 6
      });
      expect(map.length, 3);
      expect(map.get('key2'), 5);
      expect(map.get('key3'), 6);
    });
    test('onValueChanged', () {
      var ssChanged = function(event) {
        expect(e.property, 'key1');
        expect(e.newValue, 5);
        expect(e.oldValue, 4);
        map.removeEventListener(gapi.realtime.EventType.VALUE_CHANGED, ssChanged);
      };
      map.addEventListener(gapi.realtime.EventType.VALUE_CHANGED, ssChanged);
      map.set('key1',5);
    });
    test('onValueChanged add', () {
      var ssAdd = function(event) {
        expect(e.property, 'prop');
        expect(e.newValue, 'newVal');
        expect(e.oldValue, null);
        map.removeEventListener(gapi.realtime.EventType.VALUE_CHANGED, ssAdd);
      }));
      map.addEventListener(gapi.realtime.EventType.VALUE_CHANGED, ssAdd);
      map.set('prop','newVal');
    });
    test('onValueChanged remove', () {
      var ssRemove = function(event) {
        expect(e.property, 'key1');
        expect(e.oldValue, 4);
        expect(e.newValue, null);
        map.removeEventListener(gapi.realtime.EventType.VALUE_CHANGED, ssRemove);
      }));
      map.addEventListener(gapi.realtime.EventType.VALUE_CHANGED, ssRemove);
      map.remove('key1');
    });
    test('onValueChanged clear', () {
      map.set('key2','val2');
      var ssClear = function(event) {
        expect(e.newValue, null);
      }, count: 2));
      map.addEventListener(gapi.realtime.EventType.VALUE_CHANGED, ssClear);
      map.clear();
      map.removeEventListener(gapi.realtime.EventType.VALUE_CHANGED, ssClear);
    });
    test('map length on null assignment', () {
      // TODO this is different than native maps. but that is a rt problem, not rdm.
      expect(map.length, 1);
      map.set('key1',null);
      expect(map.length, 0);
    });
  });
  group('RealtimeIndexReference', () {
    var string = doc.getModel().getRoot().get('text');
    var list = doc.getModel().getRoot().get('list');
    // TODO are references ever removed?
    test('RealtimeString Reference Value', () {
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
    test('RealtimeString Delete Reference', () {
      var ref = string.registerReference(5, true);
      expect(ref.index, 5);
      string.removeRange(4, 6);
      expect(ref.index, -1);
    });
    test('RealtimeList Reference Value', () {
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
    test('RealtimeList Delete Reference', () {
      var ref = list.registerReference(5, true);
      expect(ref.index, 5);
      list.removeRange(4, 6);
      expect(ref.index, -1);
    });
    test('RealtimeString Reference Events', () {
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