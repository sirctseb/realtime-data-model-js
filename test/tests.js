initializeModel = function(model) {
  model.getRoot().set('text', model.createString('Hello Realtime World!'));
  model.getRoot().set('list', model.createList());
  model.getRoot().set('map', model.createMap());
  model.getRoot().set('book', model.create('Book'));
};

onFileLoaded = function(doc) {
  var map = doc.getModel().getRoot().get('map');
  var list = doc.getModel().getRoot().get('list');
  var string = doc.getModel().getRoot().get('text');
  module('Undo');
  test("start undo state", function() {
    strictEqual(doc.getModel().canUndo, false);
    strictEqual(doc.getModel().canRedo, false);
  });
  test('undo state after change', function() {
    doc.getModel().getRoot().get('text').setText('redid');
    strictEqual(doc.getModel().canUndo, true);
    strictEqual(doc.getModel().canRedo, false);
    strictEqual(string.getText(), 'redid');
  });
  test('undo state after undo', function() {
    doc.getModel().undo();
    strictEqual(doc.getModel().canUndo, false);
    strictEqual(doc.getModel().canRedo, true);
  });
  test('string state after undo', function() {
    strictEqual(doc.getModel().getRoot().get('text').getText(), 'Hello Realtime World!');
  });
  test('string state after redo and event/model state matching', function() {
    expect(5);
    var undo = function(event) {
      // test that event properties match model
      strictEqual(doc.getModel().canUndo, event.canUndo);
      strictEqual(doc.getModel().canRedo, event.canRedo);
      // test that undo/redo state is what we strictEqual
      strictEqual(doc.getModel().canUndo, true);
      strictEqual(doc.getModel().canRedo, false);
      doc.getModel().removeEventListener(rdm.EventType.UNDO_REDO_STATE_CHANGED, undo);
    };
    doc.getModel().addEventListener(rdm.EventType.UNDO_REDO_STATE_CHANGED, undo);
    doc.getModel().redo();
    strictEqual(doc.getModel().getRoot().get('text').getText(), 'redid');
    doc.getModel().undo();
  });
  test('undo event type', function() {
    expect(2);
    list.clear();
    var listVR = function(e) {
      strictEqual(e.type, rdm.EventType.VALUES_REMOVED);
    };
    var listVA = function(e) {
      strictEqual(e.type, rdm.EventType.VALUES_ADDED);
    };
    list.addEventListener(rdm.EventType.VALUES_REMOVED, listVR);
    list.addEventListener(rdm.EventType.VALUES_ADDED, listVA);
    list.push('value');
    doc.getModel().undo();
    list.removeEventListener(rdm.EventType.VALUES_REMOVED, listVR);
    list.removeEventListener(rdm.EventType.VALUES_ADDED, listVA);
  });
  test('event order during undo', function() {
    map.clear();
    list.clear();
    var orderString = '';
    var mapVC = function(e) {
      orderString += 'mapVC' + e.property;
    };
    var listVR = function(e) {
      orderString += 'listVR' + e.values[0];
    };
    doc.getModel().beginCompoundOperation();
    map.set('key1', 'value1');
    list.push('value');
    map.set('key2', 'value2');
    doc.getModel().endCompoundOperation();
    map.addEventListener(rdm.EventType.VALUE_CHANGED, mapVC);
    list.addEventListener(rdm.EventType.VALUES_REMOVED, listVR);
    doc.getModel().undo();
    map.removeEventListener(rdm.EventType.VALUE_CHANGED, mapVC);
    list.removeEventListener(rdm.EventType.VALUES_REMOVED, listVR);
    strictEqual(orderString, 'mapVCkey2listVRvaluemapVCkey1');
  });
  test('event order with event handler', function() {
    map.clear();
    list.clear();
    list.push(1);
    var first = true;
    var orderString = '';
    var mapVC = function(e) {
      orderString += 'mapVC';
      if(first) {
        list.set(0,2);
        strictEqual(list.get(0), 2);
        first = false;
      }
    };
    var listVS = function(e) {
      orderString += 'listVS' + e.newValues[0];
    };
    map.addEventListener(rdm.EventType.VALUE_CHANGED, mapVC);
    list.addEventListener(rdm.EventType.VALUES_SET, listVS);
    map.set('key', 'val');
    strictEqual(list.get(0), 2);
    strictEqual(orderString, 'mapVClistVS2');
    orderString = '';
    doc.getModel().undo();
    strictEqual(list.get(0), 1);
    strictEqual(orderString, 'listVS1');
    orderString = '';
    doc.getModel().redo();
    strictEqual(list.get(0), 2);
    strictEqual(orderString, 'listVS2');
    map.removeEventListener(rdm.EventType.VALUE_CHANGED, mapVC);
    list.removeEventListener(rdm.EventType.VALUES_SET, listVS);
  });
  test('Undo outside root graph', function() {
    expect(2);
    var str = doc.getModel().createString('string');
    var deleted = function(event) {
      strictEqual(event.type, rdm.EventType.TEXT_DELETED);
      strictEqual(event.text, 'added');
    };
    str.append('added');
    str.addEventListener(rdm.EventType.TEXT_DELETED, deleted);
    doc.getModel().undo();
    str.removeEventListener(rdm.EventType.TEXT_DELETED, deleted);
  });

  module('Compound Operations');
  test('Compound map additions', function() {
    map.set('compound1', 'val1');
    map.set('compound2', 'val2');
    doc.getModel().undo();
    notEqual(map.keys().indexOf('compound1'), -1);
    strictEqual(map.keys().indexOf('compound2'), -1);
    doc.getModel().undo();
    doc.getModel().beginCompoundOperation();
    map.set('compound1', 'val1');
    map.set('compound2', 'val2');
    doc.getModel().endCompoundOperation();
    strictEqual(map.get('compound1'), 'val1');
    strictEqual(map.get('compound2'), 'val2');
    doc.getModel().undo();
    strictEqual(map.keys().indexOf('compound1'), -1);
    strictEqual(map.keys().indexOf('compound2'), -1);
  });
  test('Compound events', function() {
    expect(8);
    map.clear();
    var rootOC = function(e) {
      strictEqual(e.type, 'object_changed');
    };
    var mapVC = function(e) {
      strictEqual(e.type, 'value_changed');
    };
    var mapOC = function(e) {
      strictEqual(e.type, 'object_changed');
    };
    doc.getModel().getRoot().addEventListener(rdm.EventType.OBJECT_CHANGED, rootOC);
    map.addEventListener(rdm.EventType.VALUE_CHANGED, mapVC);
    map.addEventListener(rdm.EventType.OBJECT_CHANGED, mapOC);
    doc.getModel().beginCompoundOperation();
    map.set('compound1', 'val1');
    map.set('compound2', 'val2');
    doc.getModel().endCompoundOperation();
    doc.getModel().undo();
    doc.getModel().getRoot().removeEventListener(rdm.EventType.OBJECT_CHANGED, rootOC);
    map.removeEventListener(rdm.EventType.VALUE_CHANGED, mapVC);
    map.removeEventListener(rdm.EventType.OBJECT_CHANGED, mapOC);
  });
  test('Compound list, string, map', function() {
    map.clear();
    map.set('key1', 'val1');
    list.clear();
    list.push('val1');
    string.setText('val1');
    doc.getModel().beginCompoundOperation();
    map.delete('key1');
    map.set('key2', 'val2');
    list.remove(0);
    list.push('val2');
    string.setText('val2');
    doc.getModel().endCompoundOperation();
    strictEqual(map.keys().indexOf('key1'), -1);
    strictEqual(map.get('key2'), 'val2');
    strictEqual(list.indexOf('val1'), -1);
    strictEqual(list.get(0), 'val2');
    strictEqual(string.getText(), 'val2');
    doc.getModel().undo();
    strictEqual(map.keys().indexOf('key2'), -1);
    strictEqual(map.get('key1'), 'val1');
    strictEqual(list.indexOf('val2'), -1);
    strictEqual(list.get(0), 'val1');
    strictEqual(string.getText(), 'val1');
  });
  test('List, map events', function() {
    expect(4);
    map.clear();
    list.clear();
    doc.getModel().beginCompoundOperation();
    map.set('key1', 'val1');
    map.set('key2', 'val2');
    list.push('val1');
    doc.getModel().endCompoundOperation();
    var rootOC = function(e) {
      strictEqual(e.type, 'object_changed');
    };
    var listOC = function(e) {
      strictEqual(e.type, 'object_changed');
    };
    var mapOC = function(e) {
      strictEqual(e.type, 'object_changed');
    };
    doc.getModel().getRoot().addEventListener(rdm.EventType.OBJECT_CHANGED, rootOC);
    map.addEventListener(rdm.EventType.OBJECT_CHANGED, mapOC);
    list.addEventListener(rdm.EventType.OBJECT_CHANGED, listOC);
    doc.getModel().undo();
    doc.getModel().getRoot().removeEventListener(rdm.EventType.OBJECT_CHANGED, rootOC);
    map.removeEventListener(rdm.EventType.OBJECT_CHANGED, mapOC);
    list.removeEventListener(rdm.EventType.OBJECT_CHANGED, listOC);
  });
  test('nested compound operations', function() {
    map.clear();
    map.set('key', 0);
    list.clear();
    list.push(0);
    string.setText('0');
    doc.getModel().beginCompoundOperation();
    map.set('key', 1);
    doc.getModel().beginCompoundOperation();
    list.set(0, 1);
    doc.getModel().endCompoundOperation();
    string.setText('1');
    doc.getModel().endCompoundOperation();
    strictEqual(map.get('key'), 1);
    strictEqual(list.get(0), 1);
    strictEqual(string.getText(), '1');
    doc.getModel().undo();
    strictEqual(map.get('key'), 0);
    strictEqual(list.get(0), 0);
    strictEqual(string.getText(), '0');
  });
  test('unmatched endCompoundOperation', function() {
    throws(function() {doc.getModel().endCompoundOperation();},
      /Not in a compound operation./,
      'Throw "Not in a compound operation." error'
    );
  });

  module('CollaborativeString', {
    setup: function() {
      string.setText('unittest');
    }});
  test('get length', function() {
    strictEqual(string.length, 8);
  });
  test('append(String text)', function() {
    string.append(' append');
    strictEqual(string.getText(), 'unittest append');
  });
  test('get text', function() {
    strictEqual(string.getText(), 'unittest');
  });
  test('insertString(int index, String text)', function() {
    string.insertString(4, ' append ');
    strictEqual(string.getText(), 'unit append test');
  });
  test('removeRange(int startIndex, int endIndex)', function() {
    string.removeRange(4, 6);
    strictEqual(string.getText(), 'unitst');
  });
  test('set text(String text)', function() {
    string.setText('newValue');
    strictEqual(string.getText(), 'newValue');
  });
  test('onTextInserted', function() {
    expect(2);
    var ssInsert = function(event) {
      strictEqual(event.index, 4);
      strictEqual(event.text, ' append ');
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
      strictEqual(event.index, 4);
      strictEqual(event.text, 'te');
      string.removeEventListener(rdm.EventType.TEXT_INSERTED, ssInsert);
      string.removeEventListener(rdm.EventType.TEXT_DELETED, ssDelete);
    };
    string.addEventListener(rdm.EventType.TEXT_INSERTED, ssInsert);
    string.addEventListener(rdm.EventType.TEXT_DELETED, ssDelete);
    string.removeRange(4, 6);
  });
  test('string diff', function() {
    var events = [];
    var sOC = function(e) {
      e.events.map(function(event) {
        events.push({type: event.type, text: event.text, index: event.index});
      });
    };
    string.setText('Hello Realtime World!');
    string.addEventListener(rdm.EventType.OBJECT_CHANGED, sOC);
    string.setText('redid');
    string.removeEventListener(rdm.EventType.OBJECT_CHANGED, sOC);
    var json = '[{"type":"text_deleted","text":"Hello R","index":0},{"type":"text_inserted","text":"r","index":0},{"type":"text_deleted","text":"alt","index":2},{"type":"text_inserted","text":"d","index":2},{"type":"text_deleted","text":"me World!","index":4},{"type":"text_inserted","text":"d","index":4}]';
    deepEqual(events, JSON.parse(json));
  });
  test('toString', function() {
    string.setText('stringValue');
    strictEqual(string.toString(), 'stringValue');
  });

  module('CollaborativeList', {
    setup: function() {
      list.clear();
      list.push('s1');
    }});
  test('get length', function() {
    strictEqual(list.length, 1);
  });
  test('set length', function() {
    list.push('s2');
    strictEqual(list.length, 2);
    list.length = 1;
    strictEqual(list.length, 1);
    throws(function() {list.length = 3;},
      /Cannot set the list length to be greater than the current value./
      );
    strictEqual(list.length, 1);
  });
  test('asArray()', function() {
    var array = [1,2,3,4];
    var l = doc.getModel().createList(array);
    deepEqual(array, l.asArray());
  });
  test('clear()', function() {
    list.clear();
    strictEqual(list.length, 0);
  });
  test('get()', function() {
    strictEqual(list.get(0), 's1');
    throws(function() {
      list.get(-1);
    }, /Index: -1, Size: 1/);
    throws(function() {
      list.get(1);
    }, /Index: 1, Size: 1/);
  });
  test('indexOf(value, opt_comparatorFn)', function() {
    list.clear();
    list.pushAll([1,2,3]);
    strictEqual(list.indexOf(2), 1);
    strictEqual(list.indexOf(4), -1);
  });
  test('insert(int index, E value)', function() {
    list.insert(0, 's0');
    strictEqual(list.length, 2);
    strictEqual(list.get(0), 's0');
    strictEqual(list.get(1), 's1');
  });
  test('insertAll(int index, values)', function() {
    list.clear();
    list.pushAll([0,3]);
    list.insertAll(1, [1,2]);
    deepEqual(list.asArray(), [0,1,2,3]);
  });
  test('lastIndexOf(value, opt_comparatorFn)', function() {
    list.clear();
    list.pushAll([1,2,3]);
    strictEqual(list.lastIndexOf(2), 1);
    strictEqual(list.lastIndexOf(0), -1);
  });
  test('move(index, destinationIndex)', function() {
    expect(15);
    list.clear();
    list.pushAll([0,1,2]);
    var set = function(event) {
      ok(false, 'Set event should not occur');
    };
    var iter = 0;
    var added = function(event) {
      deepEqual(event.values, [0]);
      strictEqual(event.index, [0,1,2][iter]);
      iter = iter + 1;
    };
    var removed = function(event) {
      deepEqual(event.values, [0]);
      strictEqual(event.index, 0);
    };
    list.addEventListener(rdm.EventType.VALUES_SET, set);
    list.addEventListener(rdm.EventType.VALUES_ADDED, added);
    list.addEventListener(rdm.EventType.VALUES_REMOVED, removed);
    // TODO rt implementation hangs on index = -1
    // list.move(-1, 0);
    // throws(function() {
    //   list.move(-1, 0);
    // }, /Index: -1, Size: 1/);
    list.move(0,0);
    deepEqual(list.asArray(), [0,1,2]);
    list.move(0,1);
    deepEqual(list.asArray(), [0,1,2]);
    list.move(0,2);
    deepEqual(list.asArray(), [1,0,2]);
    list.removeEventListener(rdm.EventType.VALUES_SET, set);
    list.removeEventListener(rdm.EventType.VALUES_ADDED, added);
    list.removeEventListener(rdm.EventType.VALUES_REMOVED, removed);
  });
  test('moveToList(index, destination, destinationIndex)', function() {
    list.clear();
    list.pushAll([0,1,2]);
    var list2 = doc.getModel().createList([0,1,2]);
    doc.getModel().getRoot().set('list2', list2);
    list.moveToList(0, list, 2);
    deepEqual(list.asArray(), [1,0,2]);
    list.moveToList(0, list2, 2);
    deepEqual(list2.asArray(), [0,1,1,2]);
    doc.getModel().getRoot().delete('list2');
  });
  test('push(E value)', function() {
    strictEqual(list.push('s2'), 2);
    strictEqual(list.length, 2);
    strictEqual(list.get(0), 's1');
    strictEqual(list.get(1), 's2');
  });
  test('pushAll(values)', function() {
    list.clear();
    list.pushAll([0,1,2]);
    deepEqual(list.asArray(), [0,1,2]);
  });
  test('remove(int index)', function() {
    list.remove(0);
    strictEqual(list.length, 0);
  });
  test('removeRange(startIndex, endIndex)', function() {
    list.clear();
    list.pushAll([0,1,2,3]);
    list.removeRange(1,3);
    deepEqual(list.asArray(), [0,3]);
  });
  test('removeValue(value)', function() {
    list.clear();
    list.pushAll([1,2,3]);
    list.removeValue(2);
    deepEqual(list.asArray(), [1,3]);
  });
  test('replaceRange(index, values)', function() {
    expect(6);
    var added = function(event) {
      ok(true);
    };
    var removed = function(event) {
      ok(true);
    };
    var set = function(event) {
      deepEqual(event.newValues, [4,5]);
      deepEqual(event.oldValues, [1,2]);
    };
    list.clear();
    list.pushAll([0,1,2,3]);
    list.addEventListener(rdm.EventType.VALUES_ADDED, added);
    list.addEventListener(rdm.EventType.VALUES_REMOVED, removed);
    list.addEventListener(rdm.EventType.VALUES_SET, set);
    list.replaceRange(1, [4,5]);
    deepEqual(list.asArray(), [0,4,5,3]);
    throws(function() {
      list.replaceRange(3, [6,7]);
    }, /Index: 4, Size: 4/);
    deepEqual(list.asArray(), [0,4,5,3]);
    throws(function() {
      list.replaceRange(-1, [1,2]);
    }, /Index: -1, Size: 4/);
    list.removeEventListener(rdm.EventType.VALUES_ADDED, added);
    list.removeEventListener(rdm.EventType.VALUES_REMOVED, removed);
    list.removeEventListener(rdm.EventType.VALUES_SET, set);
  });
  test('set(value)', function() {
    list.set(0, 'new s1');
    strictEqual(list.get(0), 'new s1');
  });
  test('onValuesAdded', function() {
    expect(2);
    var ss = function(event) {
      strictEqual(event.index, 1);
      deepEqual(event.values, ['s2']);
      list.removeEventListener(rdm.EventType.VALUES_ADDED, ss);
    };
    list.addEventListener(rdm.EventType.VALUES_ADDED, ss);
    list.push('s2');
  });
  test('onValuesRemoved', function() {
    expect(2);
    var ss = function(event) {
      strictEqual(event.index, 0);
      deepEqual(event.values, ['s1']);
      list.removeEventListener(rdm.EventType.VALUES_REMOVED, ss);
    };
    list.addEventListener(rdm.EventType.VALUES_REMOVED, ss);
    list.clear();
  });
  test('onValuesSet', function() {
    expect(3);
    var ss = function(event) {
      strictEqual(event.index, 0);
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
      strictEqual(event.events[0].type, rdm.EventType.VALUES_ADDED);
    };
    doc.getModel().getRoot().addEventListener(rdm.EventType.OBJECT_CHANGED, ss);

    list.push('value');

    doc.getModel().getRoot().removeEventListener(rdm.EventType.OBJECT_CHANGED, ss);
  });
  test('same value', function() {
    expect(4);
    var listVS = function(e) {
      strictEqual(e.type, rdm.EventType.VALUES_SET);
      strictEqual(e.newValues[0], 1);
    };
    list.addEventListener(rdm.EventType.VALUES_SET, listVS);
    list.set(0, 1);
    list.set(0, 1);
    list.removeEventListener(rdm.EventType.VALUES_SET, listVS);
  });
  test('set out of range', function() {
    throws(function() {
      list.set(-1, 1);
      // TODO rt throws error with {n: 'Index: -1, Size: 1'}
    });
  });
  test('toString', function() {
    list.clear();
    list.push(1);
    list.push([1,2,3]);
    list.push('string');
    list.push({'string': 1});
    list.push(doc.getModel().createString('collabString'));
    list.push(doc.getModel().createList([1,2,3]));
    list.push(doc.getModel().createMap({string: 1}));
    strictEqual(list.toString(), "[[JsonValue 1], [JsonValue [1,2,3]], [JsonValue \"string\"], [JsonValue {\"string\":1}], collabString, [[JsonValue 1], [JsonValue 2], [JsonValue 3]], {string: [JsonValue 1]}]");
  });

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
    strictEqual(map.has('nullkey'), false);
    map.set('nullkey', null);
    strictEqual(map.get('nullkey'), null);
    strictEqual(map.has('nullkey'), false);
    strictEqual(map.keys().indexOf('nullkey'), -1);
    map.set('nullkey', 'value');
    doc.getModel().undo();
    strictEqual(map.has('nullkey'), false);
    strictEqual(map.keys().indexOf('nullkey'), -1);
  });
  test('size with null', function() {
    strictEqual(map.size, 1);
    map.set('nullkey', null);
    strictEqual(map.size, 1);
  })
  test('operator [](String key)', function() {
    strictEqual(map.get('key1'), 4);
    strictEqual(map.size, 1);
  });
  test('set(key, value)', function() {
    strictEqual(map.set('key2',5), null);
    strictEqual(map.get('key2'), 5);
    strictEqual(map.set('key2', 4), 5);
  });
  test('delete', function() {
    map.delete('key1');
    strictEqual(map.size, 0);
    strictEqual(map.get('key1'), null);
  });
  test('clear', function() {
    map.clear();
    strictEqual(map.size, 0);
  });
  test('keys', function() {
    map.clear();
    map.set('a', 'a');
    map.set('b', 'b');
    map.set('c', 'c');
    map.set('d', 'd');
    map.set('e', 'e');
    deepEqual(map.keys(), ['e', 'a', 'c', 'd', 'b']);
  });
  test('set same value', function() {
    map.set('key1', 'val1');
    strictEqual(map.set('key1', 'val1'), 'val1');
  });
  test('onValueChanged', function() {
    expect(3);
    var ssChanged = function(event) {
      strictEqual(event.property, 'key1');
      strictEqual(event.newValue, 5);
      strictEqual(event.oldValue, 4);
      map.removeEventListener(rdm.EventType.VALUE_CHANGED, ssChanged);
    };
    map.addEventListener(rdm.EventType.VALUE_CHANGED, ssChanged);
    map.set('key1',5);
  });
  test('onValueChanged add', function() {
    expect(3);
    var ssAdd = function(event) {
      strictEqual(event.property, 'prop');
      strictEqual(event.newValue, 'newVal');
      strictEqual(event.oldValue, null);
      map.removeEventListener(rdm.EventType.VALUE_CHANGED, ssAdd);
    };
    map.addEventListener(rdm.EventType.VALUE_CHANGED, ssAdd);
    map.set('prop','newVal');
  });
  test('onValueChanged remove', function() {
    expect(3);
    var ssRemove = function(event) {
      strictEqual(event.property, 'key1');
      strictEqual(event.oldValue, 4);
      strictEqual(event.newValue, null);
      map.removeEventListener(rdm.EventType.VALUE_CHANGED, ssRemove);
    };
    map.addEventListener(rdm.EventType.VALUE_CHANGED, ssRemove);
    map.delete('key1');
  });
  test('onValueChanged clear', function() {
    expect(2);
    map.set('key2','val2');
    var ssClear = function(event) {
      strictEqual(event.newValue, null);
    }; //, count: 2));
    map.addEventListener(rdm.EventType.VALUE_CHANGED, ssClear);
    map.clear();
    map.removeEventListener(rdm.EventType.VALUE_CHANGED, ssClear);
  });
  test('map length on null assignment', function() {
    // TODO this is different than native maps. but that is a rt problem, not rdm.
    strictEqual(map.size, 1);
    map.set('key1',null);
    strictEqual(map.size, 0);
  });
  test('set return value', function() {
    map.clear();
    map.set('key', 'val');
    var oldVal = map.set('key', 'val2');
    strictEqual(oldVal, 'val');
  });
  test('delete return value', function() {
    map.set('key', 'val');
    var oldVal = map.delete('key');
    strictEqual(oldVal, 'val');
  });
  test('same value', function() {
    expect(1);
    map.clear();
    map.set('key1', 'val1');
    var mapVC = function(e) {
      strictEqual(e.newValue, 'val3');
      strictEqual(e.oldValue, 'val2');
    };
    map.addEventListener(rdm.EventType.VALUE_CHANGED, mapVC);
    strictEqual(map.set('key1', 'val1'), 'val1');
    map.removeEventListener(rdm.EventType.VALUE_CHANGED, mapVC);
  });
  test('undo to absent', function() {
    map.clear();
    strictEqual(map.has('key1'), false);
    strictEqual(map.keys().indexOf('key1'), -1);
    map.set('key1', 'val1');
    strictEqual(map.has('key1'), true);
    notEqual(map.keys().indexOf('key1'), -1);
    doc.getModel().undo();
    strictEqual(map.has('key1'), false);
    strictEqual(map.keys().indexOf('key1'), -1);
  });
  test('toString', function() {
    map.clear();
    map.set('string', 1);
    strictEqual(map.toString(), '{string: [JsonValue 1]}');
  });

  module('RealtimeIndexReference');
  // TODO are references ever removed?
  test('RealtimeString Reference Value', function() {
    string.setText("aaaaaaaaaa");
    var ref = string.registerReference(5, false);
    strictEqual(ref.index, 5);
    string.insertString(2, "x");
    strictEqual(ref.index, 6);
    doc.getModel().undo();
    strictEqual(ref.index, 5);
    string.insertString(8, "x");
    strictEqual(ref.index, 5);
    string.removeRange(0, 2);
    strictEqual(ref.index, 3);
    string.removeRange(2, 4);
    strictEqual(ref.index, 2);
  });
  test('RealtimeString Delete Reference', function() {
    var ref = string.registerReference(5, true);
    strictEqual(ref.index, 5);
    string.removeRange(4, 6);
    strictEqual(ref.index, -1);
  });
  test('RealtimeList Reference Value', function() {
    list.clear();
    list.pushAll([1,2,3,4,5,6,7,8,9,10,11,12]);
    var ref = list.registerReference(5, false);
    strictEqual(ref.index, 5);
    list.insert(2, 9);
    strictEqual(ref.index, 6);
    doc.getModel().undo();
    strictEqual(ref.index, 5);
    list.insert(8, 9);
    strictEqual(ref.index, 5);
    list.removeRange(0, 2);
    strictEqual(ref.index, 3);
    list.removeRange(2, 4);
    strictEqual(ref.index, 2);
  });
  test('RealtimeList Delete Reference', function() {
    var ref = list.registerReference(5, true);
    strictEqual(ref.index, 5);
    list.removeRange(4, 6);
    strictEqual(ref.index, -1);
  });
  test('RealtimeString Reference Events', function() {
    expect(3);
    string.setText("aaaaaaaaaa");
    var ref = string.registerReference(5, true);
    var ssRef = function(event) {
      strictEqual(event.oldIndex, 5);
      strictEqual(event.newIndex, 7);
      strictEqual(ref.index, 7);
      ref.removeEventListener(rdm.EventType.REFERENCE_SHIFTED,ssRef);
    };
    ref.addEventListener(rdm.EventType.REFERENCE_SHIFTED,ssRef);
    string.insertString(0, "xx");
  });
  test('Assign index', function() {
    string.setText("aaaaaaaaaa");
    var ref = string.registerReference(5, true);
    strictEqual(ref.index, 5);
    ref.index = 7;
    strictEqual(ref.index, 7);
    string.insertString(0, "xx");
    strictEqual(ref.index, 9);
  });
  test('resurrect index', function() {
    var ref = string.registerReference(2, true);
    string.removeRange(1,3);
    strictEqual(ref.index, -1);
    ref.index = 3;
    strictEqual(ref.index, 3);
    string.insertString(0, "x");
    strictEqual(ref.index, 4);
  });
  test('canBeDeleted', function() {
    var refTrue = string.registerReference(3, true);
    strictEqual(refTrue.canBeDeleted, true);
    var refFalse = string.registerReference(3, false);
    strictEqual(refFalse.canBeDeleted, false);
  });
  test('referencedObject', function() {
    var ref = string.registerReference(2, false);
    strictEqual(ref.referencedObject, string);
  });

  module('Initial Values');
  test('map', function() {
    doc.getModel().getRoot().set('filled-map', doc.getModel().createMap({'key1': doc.getModel().createString(), 'key2': 4}));
    strictEqual(doc.getModel().getRoot().get('filled-map').get('key1').getText(), '');
    strictEqual(doc.getModel().getRoot().get('filled-map').get('key2'), 4);
  });
  test('list', function() {
    doc.getModel().getRoot().set('filled-list', doc.getModel().createList([doc.getModel().createString(), 4]));
    strictEqual(doc.getModel().getRoot().get('filled-list').get(0).getText(), '');
    strictEqual(doc.getModel().getRoot().get('filled-list').get(1), 4);
  });
  test('string', function() {
    doc.getModel().getRoot().set('filled-string', doc.getModel().createString('content'));
    strictEqual(doc.getModel().getRoot().get('filled-string').getText(), 'content');
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
    strictEqual(order, 'rootCapturestringEventrootBubble');
  });
  test('Execution order', function() {
    string.setText('abc');
    var handler = function(e) {
      strictEqual(string.getText(), 'def');
    };
    string.addEventListener(rdm.EventType.TEXT_DELETED, handler);
    string.setText('def');
    string.removeEventListener(rdm.EventType.TEXT_DELETED, handler);
  });

  module('Custom');
  test('Book is custom object', function() {
    strictEqual(rdm.custom.isCustomObject(doc.getModel().getRoot().get('book')), true);
    strictEqual(rdm.custom.isCustomObject(doc.getModel().getRoot().get('text')), false);
  });
  test('Initializer fn', function() {
    strictEqual(doc.getModel().getRoot().get('book').title, 'Foundation');
  });
  test('Set title', function() {
    expect(6);
    strictEqual(doc.getModel().getRoot().get('book').title, 'Foundation');
    var oc_handler = function(e) {
      strictEqual(e.events[0].type, 'value_changed');
    };
    doc.getModel().getRoot().get('book').addEventListener(rdm.EventType.OBJECT_CHANGED, oc_handler);
    var vc_handler = function(e) {
      strictEqual(e.property, 'title');
      strictEqual(e.oldValue, 'Foundation');
      strictEqual(e.newValue, 'title');
    };
    doc.getModel().getRoot().get('book').addEventListener(rdm.EventType.VALUE_CHANGED, vc_handler);
    doc.getModel().getRoot().get('book')['title'] = 'title';
    strictEqual(doc.getModel().getRoot().get('book').title, 'title');
    doc.getModel().getRoot().get('book').removeEventListener(rdm.EventType.OBJECT_CHANGED, oc_handler);
    doc.getModel().getRoot().get('book').removeEventListener(rdm.EventType.VALUE_CHANGED, vc_handler);
  });
  test('custom.getModel', function() {
    strictEqual(doc.getModel(), rdm.custom.getModel(doc.getModel().getRoot().get('book')));
  });
  test('custom.getId', function() {
    strictEqual(goog.isString(rdm.custom.getId(doc.getModel().getRoot().get('book'))), true);
  });
  test('customObject.getId', function() {
    strictEqual(doc.getModel().getRoot().get('book').getId, undefined);
    strictEqual(doc.getModel().getRoot().get('book').id, undefined);
  });

  module('Multiple entries');
  test('Twice in one map', function() {
    expect(2);
    var str = doc.getModel().createString('dup');
    doc.getModel().getRoot().get('map').set('duplicate1', str);
    doc.getModel().getRoot().get('map').set('duplicate2', str);
    strictEqual(doc.getModel().getRoot().get('map').get('duplicate1'),
          doc.getModel().getRoot().get('map').get('duplicate2'));
    var ssObjChanged = function(e) {
      strictEqual(e.events[0].type, 'text_inserted');
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
    strictEqual(doc.getModel().getRoot().get('map').get('dupmap1').get('str'),
          doc.getModel().getRoot().get('map').get('dupmap2').get('str'));
    var ssObjChanged1 = function(e) {
      strictEqual(e.events[0].type, 'text_inserted');
    };
    doc.getModel().getRoot().get('map').get('dupmap1').addEventListener(
      rdm.EventType.OBJECT_CHANGED, ssObjChanged1);
    var ssObjChanged2 = function(e) {
      strictEqual(e.events[0].type, 'text_inserted');
    };
    doc.getModel().getRoot().get('map').get('dupmap2').addEventListener(
      rdm.EventType.OBJECT_CHANGED, ssObjChanged2);
    var ssRootChanged = function(e) {
      strictEqual(e.events[0].type, 'text_inserted');
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
      strictEqual(e.events[0].type, 'text_inserted');
    };
    doc.getModel().getRoot().get('map').get('mapwithsub').addEventListener(
      rdm.EventType.OBJECT_CHANGED,
      ssMapChanged);
    var ssSubMapChanged = function(e) {
      strictEqual(e.events[0].type, 'text_inserted');
    };
    doc.getModel().getRoot().get('map').get('mapwithsub').get('submap').addEventListener(
      rdm.EventType.OBJECT_CHANGED,
      ssSubMapChanged);
    var ssSubSubMapChanged = function(e) {
      strictEqual(e.events[0].type, 'text_inserted');
    };
    doc.getModel().getRoot().get('map').get('mapwithsub').get('submap').get('subsubmap').addEventListener(
      rdm.EventType.OBJECT_CHANGED,
      ssSubSubMapChanged);
    var ssStringChanged = function(e) {
      strictEqual(e.events[0].type, 'text_inserted');
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
      strictEqual(e.events[0].type, 'value_changed');
    };
    map1.addEventListener(rdm.EventType.OBJECT_CHANGED, ssMap1);
    var ssMap2 = function(e) {
      strictEqual(e.events[0].type, 'value_changed');
    };
    map2.addEventListener(rdm.EventType.OBJECT_CHANGED, ssMap2);
    var ssMap = function(e) {
      strictEqual(e.events[0].type, 'value_changed');
    };
    doc.getModel().getRoot().get('map').addEventListener(rdm.EventType.OBJECT_CHANGED, ssMap);

    map1.set('text', 'text value');

    doc.getModel().getRoot().get('map').removeEventListener(rdm.EventType.OBJECT_CHANGED, ssMap);
    map1.removeEventListener(rdm.EventType.OBJECT_CHANGED, ssMap1);
    map2.removeEventListener(rdm.EventType.OBJECT_CHANGED, ssMap2);
  });
  module('Weird');
  test('Map in self', function() {
    doc.getModel().getRoot().set('self', doc.getModel().getRoot());
    strictEqual(doc.getModel().getRoot(), doc.getModel().getRoot().get('self'));
    var rootChanged = function(e) {
      strictEqual(e.events[0].type, 'value_changed');
    };
    doc.getModel().getRoot().addEventListener(
      rdm.EventType.OBJECT_CHANGED,
      rootChanged);
    doc.getModel().getRoot().get('self').set('key', 'val');
    doc.getModel().getRoot().get('self').removeEventListener(rdm.EventType.OBJECT_CHANGED, rootChanged);
  });

  module('Collaborators');
  test('is me', function() {
    var collaborators = doc.getCollaborators();
    strictEqual(collaborators.length, 1);
    strictEqual(collaborators[0].isMe, true);
    strictEqual(collaborators[0].isAnonymous, false);
  });

  module('Identical objects');
  test('In Map', function() {
    var obj = {'a': 'a'};
    map.set('dup1', obj);
    map.set('dup2', obj);
    notEqual(map.get('dup1'), map.get('dup2'));
    obj['a'] = 'b';
    strictEqual(map.get('dup1')['a'], 'a');
  });

  module('Export');
  test('root.toString', function() {
    // get string version
    var stringified = doc.getModel().getRoot().toString();
    // strip ref ids
    stringified = stringified.replace(/<(EditableString|Map|List>): [^>]+>/g, '<$1: ID>');
    // correct value
    // var correct = '{text: xxxaaaaaaaaa, filled-map: {key1: , key2: [JsonValue 4]}, map: {duplicate1: dupwhatever, mapwithsub: {submap: {subsubmap: {str: dupsomething}}, str: <EditableString: ID>}, string: [JsonValue 1], dupmap1: {str: duphello}, duplicate2: <EditableString: ID>, loop: {map2: {map1: <Map: ID>}, map2b: <Map: ID>, text: [JsonValue "text value"]}, dupmap2: {str: <EditableString: ID>}}, book: {title: [JsonValue "title"]}, list: [[JsonValue 3], [JsonValue 4], [JsonValue 7], [JsonValue 8], [JsonValue 10], [JsonValue 11], [JsonValue 12]], self: <Map: ID>, filled-list: [, [JsonValue 4]], key: [JsonValue "val"], filled-string: content}';
    var correct = '{text: xxxaaaaaaaaa, list: [[JsonValue 3], [JsonValue 4], [JsonValue 7], [JsonValue 8], [JsonValue 10], [JsonValue 11], [JsonValue 12]], map: {duplicate1: dupwhatever, mapwithsub: {submap: {subsubmap: {str: dupsomething}}, str: <EditableString: ID>}, string: [JsonValue 1], dupmap1: {str: duphello}, duplicate2: <EditableString: ID>, loop: {map2: {map1: <Map: ID>}, map2b: <Map: ID>, text: [JsonValue "text value"]}, dupmap2: {str: <EditableString: ID>}}, book: {title: [JsonValue "title"]}, filled-map: {key1: , key2: [JsonValue 4]}, filled-list: [, [JsonValue 4]], filled-string: content, self: <Map: ID>, key: [JsonValue "val"]}'
    strictEqual(stringified, correct);
  });
  test('root.toString duplicate scoped', function() {
    // get string version
    var stringified = doc.getModel().getRoot().get('self').toString();
    var s2 = doc.getModel().getRoot().toString();
    strictEqual(stringified, s2);
  });
  asyncTest('export', function(assert) {
    expect(1);
    docProvider.exportDocument(function(result) {
      // correct value
      var jsonValue = {"appId":"1066816720974","revision":243,"data":{"id":"root","type":"Map","value":{"book":{"id":"XlvCsSlXfioK","type":"Book","value":{"title":{"json":"title"}}},"filled-list":{"id":"KbY54ouZfjDj","type":"List","value":[{"id":"5ojDCWtyfjDj","type":"EditableString","value":""},{"json":4}]},"filled-map":{"id":"u162QBQRfjDg","type":"Map","value":{"key1":{"id":"h8YUGMm-fjDg","type":"EditableString","value":""},"key2":{"json":4}}},"filled-string":{"id":"sHwruTA4fjDo","type":"EditableString","value":"content"},"key":{"json":"val"},"list":{"id":"lDoU1aUnfioJ","type":"List","value":[{"json":3},{"json":4},{"json":7},{"json":8},{"json":10},{"json":11},{"json":12}]},"map":{"id":"yxOq4amKfioJ","type":"Map","value":{"duplicate1":{"id":"Ffz9b8VifjEC","type":"EditableString","value":"dupwhatever"},"duplicate2":{"ref":"Ffz9b8VifjEC"},"dupmap1":{"id":"jYbvf3qufjEI","type":"Map","value":{"str":{"id":"mdsF6PUlfjEH","type":"EditableString","value":"duphello"}}},"dupmap2":{"id":"3zTkGJRnfjEI","type":"Map","value":{"str":{"ref":"mdsF6PUlfjEH"}}},"loop":{"id":"3oQwUdslfjET","type":"Map","value":{"map2":{"id":"PBG2cdrhfjET","type":"Map","value":{"map1":{"ref":"3oQwUdslfjET"}}},"map2b":{"ref":"PBG2cdrhfjET"},"text":{"json":"text value"}}},"mapwithsub":{"id":"Q7VHKEdkfjEO","type":"Map","value":{"str":{"id":"3Ozrz4-afjEO","type":"EditableString","value":"dupsomething"},"submap":{"id":"sNZxu4TdfjEO","type":"Map","value":{"subsubmap":{"id":"09j9Bti4fjEO","type":"Map","value":{"str":{"ref":"3Ozrz4-afjEO"}}}}}}},"string":{"json":1}}},"self":{"ref":"root"},"text":{"id":"eUO6WzdGfioE","type":"EditableString","value":"xxxaaaaaaaaa"}}}};
      // set revision to 0
      jsonValue["revision"] = 0;
      // set appid to 0
      jsonValue["appId"] = 0;
      // stringify value
      jsonValue = JSON.stringify(jsonValue);
      // strip ids and refs
      jsonValue = jsonValue.replace(/"(id|ref)":"[^"]+"/g, '"$1":"ID"');
      // back into a real object
      jsonValue = JSON.parse(jsonValue);

      // set revision to 0
      result["revision"] = 0;
      // set appid to 0
      result["appId"] = 0;
      // stringify export
      var stringified = JSON.stringify(result);
      // strip ids
      stringified = stringified.replace(/"(id|ref)":"[^"]+"/g, '"$1":"ID"');
      // back into a real object
      result = JSON.parse(stringified);

      // do test
      assert.deepEqual(result, jsonValue);

      map.clear();
      list.clear();
      string.setText('');
      doc.getModel().getRoot().set('book', doc.getModel().create('Book'));

      // restart tests
      start();
    });
  });

  module('Constants');
  test('EventType', function() {
    // TODO this doesn't check for values on gapi side that are missing on our side
    // TODO if we assume they are duplicated on the gapi side, we could go by the counts
    for(var type in rdm.EventType) {
      strictEqual(rdm.EventType[type], gapi.drive.realtime.EventType[type]);
    }
  });
  test('ErrorType', function() {
    for(var type in rdm.ErrorType) {
      strictEqual(rdm.ErrorType[type], gapi.drive.realtime.ErrorType[type]);
    }
  });

  module('Close');
  test('Access existing list length', function() {
    doc.close();
    throws(function() {
      list.length;
    }, 'Document is closed.');
  });
  test('Access existing string', function() {
    throws(function() {
      string.getText();
    }, 'Document is closed.');
  });
  test('Access model', function() {
    throws(function() {
      doc.getModel();
    }, 'Document is closed.');
  });
  test('Close again', function() {
    expect(0);
    doc.close();
  });

  module('Local');
  test('Local document from data', function() {
    var data = '{"appId":"1066816720974","revision":243,"data":{"id":"root","type":"Map","value":{"book":{"id":"XlvCsSlXfioK","type":"Book","value":{"title":{"json":"title"}}},"filled-list":{"id":"KbY54ouZfjDj","type":"List","value":[{"id":"5ojDCWtyfjDj","type":"EditableString","value":""},{"json":4}]},"filled-map":{"id":"u162QBQRfjDg","type":"Map","value":{"key1":{"id":"h8YUGMm-fjDg","type":"EditableString","value":""},"key2":{"json":4}}},"filled-string":{"id":"sHwruTA4fjDo","type":"EditableString","value":"content"},"key":{"json":"val"},"list":{"id":"lDoU1aUnfioJ","type":"List","value":[{"json":3},{"json":4},{"json":7},{"json":8},{"json":10},{"json":11},{"json":12}]},"map":{"id":"yxOq4amKfioJ","type":"Map","value":{"duplicate1":{"id":"Ffz9b8VifjEC","type":"EditableString","value":"dupwhatever"},"duplicate2":{"ref":"Ffz9b8VifjEC"},"dupmap1":{"id":"jYbvf3qufjEI","type":"Map","value":{"str":{"id":"mdsF6PUlfjEH","type":"EditableString","value":"duphello"}}},"dupmap2":{"id":"3zTkGJRnfjEI","type":"Map","value":{"str":{"ref":"mdsF6PUlfjEH"}}},"loop":{"id":"3oQwUdslfjET","type":"Map","value":{"map2":{"id":"PBG2cdrhfjET","type":"Map","value":{"map1":{"ref":"3oQwUdslfjET"}}},"map2b":{"ref":"PBG2cdrhfjET"},"text":{"json":"text value"}}},"mapwithsub":{"id":"Q7VHKEdkfjEO","type":"Map","value":{"str":{"id":"3Ozrz4-afjEO","type":"EditableString","value":"dupsomething"},"submap":{"id":"sNZxu4TdfjEO","type":"Map","value":{"subsubmap":{"id":"09j9Bti4fjEO","type":"Map","value":{"str":{"ref":"3Ozrz4-afjEO"}}}}}}},"string":{"json":1}}},"self":{"ref":"root"},"text":{"id":"eUO6WzdGfioE","type":"EditableString","value":"xxxaaaaaaaaa"}}}}';
    var dp = new rdm.LocalDocumentProvider(data);
    dp.loadDocument(
      function() {
        dp.exportDocument(function(result) {
          // correct value
          var jsonValue = {"appId":"1066816720974","revision":243,"data":{"id":"root","type":"Map","value":{"book":{"id":"XlvCsSlXfioK","type":"Book","value":{"title":{"json":"title"},"author":{"json":"Isaac Asimov"}}},"filled-list":{"id":"KbY54ouZfjDj","type":"List","value":[{"id":"5ojDCWtyfjDj","type":"EditableString","value":""},{"json":4}]},"filled-map":{"id":"u162QBQRfjDg","type":"Map","value":{"key1":{"id":"h8YUGMm-fjDg","type":"EditableString","value":""},"key2":{"json":4}}},"filled-string":{"id":"sHwruTA4fjDo","type":"EditableString","value":"content"},"key":{"json":"val"},"list":{"id":"lDoU1aUnfioJ","type":"List","value":[{"json":3},{"json":4},{"json":7},{"json":8},{"json":10},{"json":11},{"json":12}]},"map":{"id":"yxOq4amKfioJ","type":"Map","value":{"duplicate1":{"id":"Ffz9b8VifjEC","type":"EditableString","value":"dupwhatever"},"duplicate2":{"ref":"Ffz9b8VifjEC"},"dupmap1":{"id":"jYbvf3qufjEI","type":"Map","value":{"str":{"id":"mdsF6PUlfjEH","type":"EditableString","value":"duphello"}}},"dupmap2":{"id":"3zTkGJRnfjEI","type":"Map","value":{"str":{"ref":"mdsF6PUlfjEH"}}},"loop":{"id":"3oQwUdslfjET","type":"Map","value":{"map2":{"id":"PBG2cdrhfjET","type":"Map","value":{"map1":{"ref":"3oQwUdslfjET"}}},"map2b":{"ref":"PBG2cdrhfjET"},"text":{"json":"text value"}}},"mapwithsub":{"id":"Q7VHKEdkfjEO","type":"Map","value":{"str":{"id":"3Ozrz4-afjEO","type":"EditableString","value":"dupsomething"},"submap":{"id":"sNZxu4TdfjEO","type":"Map","value":{"subsubmap":{"id":"09j9Bti4fjEO","type":"Map","value":{"str":{"ref":"3Ozrz4-afjEO"}}}}}}},"string":{"json":1}}},"self":{"ref":"root"},"text":{"id":"eUO6WzdGfioE","type":"EditableString","value":"xxxaaaaaaaaa"}}}};
          // set revision to 0
          jsonValue["revision"] = 0;
          // set appid to 0
          jsonValue["appId"] = 0;
          // stringify value
          jsonValue = JSON.stringify(jsonValue);
          // strip ids and refs
          jsonValue = jsonValue.replace(/"(id|ref)":"[^"]+"/g, '"$1":"ID"');
          // back into a real object
          jsonValue = JSON.parse(jsonValue);

          // set revision to 0
          result["revision"] = 0;
          // set appid to 0
          result["appId"] = 0;
          // stringify export
          var stringified = JSON.stringify(result);
          // strip ids
          stringified = stringified.replace(/"(id|ref)":"[^"]+"/g, '"$1":"ID"');
          // back into a real object
          result = JSON.parse(stringified);

          // do test
          deepEqual(result, jsonValue);
        });
      })
  });
};
