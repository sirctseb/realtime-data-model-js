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
    equal(doc.getModel().canUndo, false);
    equal(doc.getModel().canRedo, false);
  });
  test('undo state after change', function() {
    doc.getModel().getRoot().get('text').setText('redid');
    equal(doc.getModel().canUndo, true);
    equal(doc.getModel().canRedo, false);
    equal(string.getText(), 'redid');
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
  test('undo event type', function() {
    expect(2);
    list.clear();
    var listVR = function(e) {
      equal(e.type, rdm.EventType.VALUES_REMOVED);
    };
    var listVA = function(e) {
      equal(e.type, rdm.EventType.VALUES_ADDED);
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
    equal(orderString, 'mapVCkey2listVRvaluemapVCkey1');
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
        equal(list.get(0), 2);
        first = false;
      }
    };
    var listVS = function(e) {
      orderString += 'listVS' + e.newValues[0];
    };
    map.addEventListener(rdm.EventType.VALUE_CHANGED, mapVC);
    list.addEventListener(rdm.EventType.VALUES_SET, listVS);
    map.set('key', 'val');
    equal(list.get(0), 2);
    equal(orderString, 'mapVClistVS2');
    orderString = '';
    doc.getModel().undo();
    equal(list.get(0), 1);
    equal(orderString, 'listVS1mapVC');
    orderString = '';
    doc.getModel().redo();
    equal(list.get(0), 2);
    equal(orderString, 'mapVClistVS2');
    map.removeEventListener(rdm.EventType.VALUE_CHANGED, mapVC);
    list.removeEventListener(rdm.EventType.VALUES_SET, listVS);
  });

  module('Compound Operations');
  test('Compound map additions', function() {
    map.set('compound1', 'val1');
    map.set('compound2', 'val2');
    doc.getModel().undo();
    notEqual(map.keys().indexOf('compound1'), -1);
    equal(map.keys().indexOf('compound2'), -1);
    doc.getModel().undo();
    doc.getModel().beginCompoundOperation();
    map.set('compound1', 'val1');
    map.set('compound2', 'val2');
    doc.getModel().endCompoundOperation();
    equal(map.get('compound1'), 'val1');
    equal(map.get('compound2'), 'val2');
    doc.getModel().undo();
    equal(map.keys().indexOf('compound1'), -1);
    equal(map.keys().indexOf('compound2'), -1);
  });
  test('Compound events', function() {
    expect(10);
    map.clear();
    var rootOC = function(e) {
      equal(e.type, 'object_changed');
    };
    var mapVC = function(e) {
      equal(e.type, 'value_changed');
    };
    var mapOC = function(e) {
      equal(e.type, 'object_changed');
    };
    doc.getModel().getRoot().addEventListener(rdm.EventType.OBJECT_CHANGED, rootOC);
    map.addEventListener(rdm.EventType.VALUE_CHANGED, mapVC);
    map.addEventListener(rdm.EventType.OBJECT_CHANGED, mapOC);
    doc.getModel().beginCompoundOperation();
    map.set('compound1', 'val1');
    map.set('compound2', 'val2');
    doc.getModel().endCompoundOperation();
    doc.getModel().undo();
    // doc.getModel().redo();
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
    equal(map.keys().indexOf('key1'), -1);
    equal(map.get('key2'), 'val2');
    equal(list.indexOf('val1'), -1);
    equal(list.get(0), 'val2');
    equal(string.getText(), 'val2');
    doc.getModel().undo();
    equal(map.keys().indexOf('key2'), -1);
    equal(map.get('key1'), 'val1');
    equal(list.indexOf('val2'), -1);
    equal(list.get(0), 'val1');
    equal(string.getText(), 'val1');
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
      equal(e.type, 'object_changed');
    };
    var listOC = function(e) {
      equal(e.type, 'object_changed');
    };
    var mapOC = function(e) {
      equal(e.type, 'object_changed');
    };
    doc.getModel().getRoot().addEventListener(rdm.EventType.OBJECT_CHANGED, rootOC);
    map.addEventListener(rdm.EventType.OBJECT_CHANGED, mapOC);
    list.addEventListener(rdm.EventType.OBJECT_CHANGED, listOC);
    doc.getModel().undo();
    doc.getModel().getRoot().removeEventListener(rdm.EventType.OBJECT_CHANGED, rootOC);
    map.removeEventListener(rdm.EventType.OBJECT_CHANGED, mapOC);
    list.removeEventListener(rdm.EventType.OBJECT_CHANGED, listOC);
  });
  test('undo in compound map set operation from empty', function() {
    map.clear();
    var mapVC = function(e) {
      console.log(e.oldValue + ' -> ' + e.newValue);
    };
    map.addEventListener(rdm.EventType.VALUE_CHANGED, mapVC);
    map.set('key2', 'val2');
    doc.getModel().beginCompoundOperation();
    map.set('key1', 'val1');
    equal(map.get('key1'), 'val1');
    equal(doc.getModel().canUndo, true);
    doc.getModel().undo();
    equal(map.get('key1'), 'val1');
    doc.getModel().endCompoundOperation();
    equal(map.get('key1'), 'val1');
    equal(doc.getModel().canRedo, false);
    map.removeEventListener(rdm.EventType.VALUE_CHANGED, mapVC);
  });
  test('undo in compound map set operation from value', function() {
    map.clear();
    map.set('key1', 'val1');
    doc.getModel().beginCompoundOperation();
    map.set('key1', 'val2');
    equal(map.get('key1'), 'val2');
    doc.getModel().undo();
    equal(map.get('key1'), null);
    doc.getModel().endCompoundOperation();
    equal(map.get('key1'), null);
    equal(doc.getModel().canRedo, false);
  });
  test('undo in compound map set operation from 2 values', function() {
    map.clear();
    map.set('key1', 'val0');
    map.set('key1', 'val1');
    doc.getModel().beginCompoundOperation();
    map.set('key1', 'val2');
    doc.getModel().undo();
    doc.getModel().endCompoundOperation();
    equal(map.get('key1'), 'val0');
    equal(doc.getModel().canRedo, false);
  });
  test('undo in compound map set operation from 4 values', function() {
    var oldValue;
    var newValue;
    var mapVC = function(e) {
      console.log('old: ' + e.oldValue + ', new: ' + e.newValue);
      equal(e.oldValue, oldValue);
      equal(e.newValue, newValue);
      // special case updates for paired undo / redo events
      if(oldValue === 'val2' && newValue === 'val4') {
        oldValue = 'val4'; newValue = 'val3';
      } else if(oldValue === 'val3' && newValue === 'val4') {
        oldValue = 'val4'; newValue = 'val2';
      }
    };
    map.clear();
    map.addEventListener(rdm.EventType.VALUE_CHANGED, mapVC);
    oldValue = null; newValue = 'val0';
    map.set('key1', 'val0');
    oldValue = 'val0'; newValue = 'val1';
    map.set('key1', 'val1');
    oldValue = 'val1'; newValue = 'val2';
    map.set('key1', 'val2');
    oldValue = 'val2'; newValue = 'val3';
    map.set('key1', 'val3');
    doc.getModel().beginCompoundOperation();
    oldValue = 'val3'; newValue = 'val4';
    console.log('set to val4 in compound');
    map.set('key1', 'val4');
    equal(map.get('key1'), 'val4');
    oldValue = 'val4'; newValue = 'val2';
    console.log('undo in compound');
    doc.getModel().undo();
    equal(map.get('key1'), 'val2');
    equal(doc.getModel().canRedo, false);
    doc.getModel().endCompoundOperation();
    equal(map.get('key1'), 'val2');
    equal(doc.getModel().canRedo, false);
    oldValue = 'val2'; newValue = 'val4';
    console.log('undo');
    doc.getModel().undo();
    equal(map.get('key1'), 'val3');
    equal(doc.getModel().canRedo, true);
    oldValue = 'val3'; newValue = 'val4';
    console.log('redo');
    doc.getModel().redo();
    equal(map.get('key1'), 'val2');
    equal(doc.getModel().canRedo, false);
    console.log('undo');
    oldValue = 'val2'; newValue = 'val4';
    doc.getModel().undo();
    equal(map.get('key1'), 'val3');
    oldValue = 'val3'; newValue = 'val1';
    console.log('undo');
    doc.getModel().undo();
    equal(map.get('key1'), 'val1');
    oldValue = 'val1'; newValue = 'val0';
    doc.getModel().undo();
    equal(map.get('key1'), 'val0');
    oldValue = 'val0'; newValue = null;
    doc.getModel().undo();
    equal(map.get('key1'), null);
    map.removeEventListener(rdm.EventType.VALUE_CHANGED, mapVC);
  });
  test('undo in compound map set operation with 5 values and an undo', function() {
    var oldValue;
    var newValue;
    var mapVC = function(e) {
      console.log('old: ' + e.oldValue + ', new: ' + e.newValue);
      // equal(e.oldValue, oldValue);
      // equal(e.newValue, newValue);
    };
    map.clear();
    map.addEventListener(rdm.EventType.VALUE_CHANGED, mapVC);
    // oldValue = null; newValue = 'val0';
    map.set('key1', 'val0');
    // oldValue = 'val0'; newValue = 'val1';
    map.set('key1', 'val1');
    // oldValue = 'val1'; newValue = 'val2';
    map.set('key1', 'val2');
    // oldValue = 'val2'; newValue = 'val3';
    map.set('key1', 'val3');
    // oldValue = 'val3'; newValue = 'val4';
    map.set('key1', 'val4');
    console.log('undo before compound');
    doc.getModel().undo();
    doc.getModel().beginCompoundOperation();
    // oldValue = 'val3'; newValue = 'val4';
    console.log('set to val5 in compound');
    map.set('key1', 'val5');
    equal(map.get('key1'), 'val5');
    // oldValue = 'val4'; newValue = 'val2';
    console.log('undo in compound');
    doc.getModel().undo();
    equal(map.get('key1'), 'val2');
    equal(doc.getModel().canRedo, true);
    doc.getModel().endCompoundOperation();
    equal(map.get('key1'), 'val2');
    equal(doc.getModel().canRedo, false);
    equal(doc.getModel().canUndo, true);
    // oldValue = 'val2'; newValue = 'val3';
    console.log('undo');
    doc.getModel().undo();
    equal(map.get('key1'), 'val3');
    equal(doc.getModel().canRedo, true);
    // oldValue = 'val3'; newValue = 'val2';
    console.log('redo');
    doc.getModel().redo();
    equal(map.get('key1'), 'val2');
    equal(doc.getModel().canRedo, false);
    console.log('undo');
    doc.getModel().undo();
    equal(map.get('key1'), 'val3');
    console.log('undo');
    doc.getModel().undo();
    equal(map.get('key1'), 'val1');
    console.log('undo');
    doc.getModel().undo();
    equal(map.get('key1'), 'val0');
    console.log('undo');
    doc.getModel().undo();
    equal(map.get('key1'), null);
    map.removeEventListener(rdm.EventType.VALUE_CHANGED, mapVC);
    console.log('end 5 value with undo');
  });
  test('canRedo mid-compound', function() {
    map.clear();
    var mapVC = function(e) {
      console.log('old: ' + e.oldValue + ', new: ' + e.newValue);
      // equal(e.oldValue, oldValue);
      // equal(e.newValue, newValue);
    };
    map.addEventListener(rdm.EventType.VALUE_CHANGED, mapVC);
    map.set('key1', 'val0');
    map.set('key1', 'val1');
    console.log('undo');
    doc.getModel().undo();
    equal(doc.getModel().canRedo, true);
    doc.getModel().beginCompoundOperation();
    console.log('set key1 in compound');
    map.set('key1', 'val2');
    equal(doc.getModel().canRedo, true);
    console.log('redo in compound');
    doc.getModel().redo();
    equal(doc.getModel().canRedo, false);
    doc.getModel().endCompoundOperation();
    console.log('undo');
    doc.getModel().undo();
    console.log('undo');
    doc.getModel().undo();
    console.log('undo');
    doc.getModel().undo();
    map.removeEventListener(rdm.EventType.VALUE_CHANGED, mapVC);
  });
  // test('undo OC in compound', function() {
  //   map.clear();
  //   doc.beginCompoundOperation();
  //   map.set('key1', 'val1');
  //   map.set('key2', 'val2');
  // });
  test('undo in compound list operation', function() {
    var oldValue;
    var newValue;
    list.clear();
    list.push(null);
    var listVS = function(e) {
      // console.log('old: ' + e.oldValue + ', new: ' + e.newValue);
      equal(e.oldValues[0], oldValue);
      equal(e.newValues[0], newValue);
      // special case updates for paired undo / redo events
      if(oldValue === 'val2' && newValue === 'val4') {
        oldValue = 'val4'; newValue = 'val3';
      } else if(oldValue === 'val3' && newValue === 'val4') {
        oldValue = 'val4'; newValue = 'val2';
      }
    };
    list.addEventListener(rdm.EventType.VALUES_SET, listVS);
    oldValue = null; newValue = 'val0';
    list.set(0, 'val0');
    oldValue = 'val0'; newValue = 'val1';
    list.set(0, 'val1');
    oldValue = 'val1'; newValue = 'val2';
    list.set(0, 'val2');
    oldValue = 'val2'; newValue = 'val3';
    list.set(0, 'val3');
    doc.getModel().beginCompoundOperation();
    oldValue = 'val3'; newValue = 'val4';
    console.log('set to val4 in compound');
    list.set(0, 'val4');
    equal(list.get(0), 'val4');
    oldValue = 'val4'; newValue = 'val2';
    console.log('undo in compound');
    doc.getModel().undo();
    equal(list.get(0), 'val2');
    equal(doc.getModel().canRedo, false);
    doc.getModel().endCompoundOperation();
    equal(list.get(0), 'val2');
    equal(doc.getModel().canRedo, false);
    oldValue = 'val2'; newValue = 'val4';
    console.log('undo');
    doc.getModel().undo();
    equal(list.get(0), 'val3');
    equal(doc.getModel().canRedo, true);
    oldValue = 'val3'; newValue = 'val4';
    console.log('redo');
    doc.getModel().redo();
    equal(list.get(0), 'val2');
    equal(doc.getModel().canRedo, false);
    console.log('undo');
    oldValue = 'val2'; newValue = 'val4';
    doc.getModel().undo();
    equal(list.get(0), 'val3');
    oldValue = 'val3'; newValue = 'val1';
    console.log('undo');
    doc.getModel().undo();
    equal(list.get(0), 'val1');
    oldValue = 'val1'; newValue = 'val0';
    doc.getModel().undo();
    equal(list.get(0), 'val0');
    oldValue = 'val0'; newValue = null;
    doc.getModel().undo();
    equal(list.get(0), null);
    list.removeEventListener(rdm.EventType.VALUES_SET, listVS);
  });
  test('undo in compound string operation', function() {
    string.setText('0123456789');
    // delete '345'
    string.removeRange(3,6);
    doc.getModel().beginCompoundOperation();
    string.insertString(0,'aa');
    equal(string.getText(), 'aa0126789');
    doc.getModel().undo();
    doc.getModel().endCompoundOperation();
    equal(string.getText(), 'aa0345126789');
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
    equal(map.get('key'), 1);
    equal(list.get(0), 1);
    equal(string.getText(), '1');
    doc.getModel().undo();
    equal(map.get('key'), 0);
    equal(list.get(0), 0);
    equal(string.getText(), '0');
  });

  module('CollaborativeString', {
    setup: function() {
      string.setText('unittest');
    }});
  test('get length', function() {
    equal(string.length, 8);
  });
  test('append(String text)', function() {
    string.append(' append');
    equal(string.getText(), 'unittest append');
  });
  test('get text', function() {
    equal(string.getText(), 'unittest');
  });
  test('insertString(int index, String text)', function() {
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

  module('CollaborativeList', {
    setup: function() {
      list.clear();
      list.push('s1');
    }});
  test('get length', function() {
    equal(list.length, 1);
  });
  test('set length', function() {
    list.push('s2');
    equal(list.length, 2);
    list.length = 1;
    equal(list.length, 1);
    throws(function() {list.length = 3;},
      /Cannot set the list length to be greater than the current value./
      );
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
  test('same value', function() {
    expect(4);
    var listVS = function(e) {
      equal(e.type, rdm.EventType.VALUES_SET);
      equal(e.newValues[0], 1);
    };
    list.addEventListener(rdm.EventType.VALUES_SET, listVS);
    list.set(0, 1);
    list.set(0, 1);
    list.removeEventListener(rdm.EventType.VALUES_SET, listVS);
  });
  test('set out of range', function() {
    throws(function() {
      list.set(-1, 1);
    });
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
    equal(map.has('nullkey'), false);
    map.set('nullkey', null);
    strictEqual(map.get('nullkey'), null);
    equal(map.has('nullkey'), false);
    equal(map.keys().indexOf('nullkey'), -1);
    map.set('nullkey', 'value');
    doc.getModel().undo();
    equal(map.has('nullkey'), false);
    equal(map.keys().indexOf('nullkey'), -1);
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
  test('set return value', function() {
    map.clear();
    map.set('key', 'val');
    var oldVal = map.set('key', 'val2');
    equal(oldVal, 'val');
  });
  test('delete return value', function() {
    map.set('key', 'val');
    var oldVal = map.delete('key');
    equal(oldVal, 'val');
  });
  test('same value', function() {
    expect(3);
    map.clear();
    map.set('key1', 'val1');
    map.set('key1', 'val2');
    var mapVC = function(e) {
      equal(e.newValue, 'val3');
      equal(e.oldValue, 'val2');
    };
    map.addEventListener(rdm.EventType.VALUE_CHANGED, mapVC);
    var val = map.set('key1', 'val3');
    equal(val, 'val2');
    map.removeEventListener(rdm.EventType.VALUE_CHANGED, mapVC);
  });
  test('undo to absent', function() {
    map.clear();
    equal(map.has('key1'), false);
    equal(map.keys().indexOf('key1'), -1);
    map.set('key1', 'val1');
    equal(map.has('key1'), true);
    notEqual(map.keys().indexOf('key1'), -1);
    doc.getModel().undo();
    equal(map.has('key1'), false);
    equal(map.keys().indexOf('key1'), -1);
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
    equal(rdm.custom.isCustomObject(doc.getModel().getRoot().get('book')), true);
    equal(rdm.custom.isCustomObject(doc.getModel().getRoot().get('text')), false);
  });
  test('Initializer fn', function() {
    equal(doc.getModel().getRoot().get('book').title, 'Foundation');
  });
  test('Set title', function() {
    expect(6);
    equal(doc.getModel().getRoot().get('book').title, 'Foundation');
    var oc_handler = function(e) {
      equal(e.events[0].type, 'value_changed');
    };
    doc.getModel().getRoot().get('book').addEventListener(rdm.EventType.OBJECT_CHANGED, oc_handler);
    var vc_handler = function(e) {
      equal(e.property, 'title');
      equal(e.oldValue, 'Foundation');
      equal(e.newValue, 'title');
    };
    doc.getModel().getRoot().get('book').addEventListener(rdm.EventType.VALUE_CHANGED, vc_handler);
    doc.getModel().getRoot().get('book')['title'] = 'title';
    equal(doc.getModel().getRoot().get('book').title, 'title');
    doc.getModel().getRoot().get('book').removeEventListener(rdm.EventType.OBJECT_CHANGED, oc_handler);
    doc.getModel().getRoot().get('book').removeEventListener(rdm.EventType.VALUE_CHANGED, vc_handler);
  });
  test('custom.getModel', function() {
    equal(doc.getModel(), rdm.custom.getModel(doc.getModel().getRoot().get('book')));
  });
  test('custom.getId', function() {
    equal(goog.isString(rdm.custom.getId(doc.getModel().getRoot().get('book'))), true);
  });
  test('customObject.getId', function() {
    equal(doc.getModel().getRoot().get('book').getId, undefined);
    equal(doc.getModel().getRoot().get('book').id, undefined);
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
      equal(e.events[0].type, 'text_inserted');
    };
    doc.getModel().getRoot().get('map').get('dupmap1').addEventListener(
      rdm.EventType.OBJECT_CHANGED, ssObjChanged1);
    var ssObjChanged2 = function(e) {
      equal(e.events[0].type, 'text_inserted');
    };
    doc.getModel().getRoot().get('map').get('dupmap2').addEventListener(
      rdm.EventType.OBJECT_CHANGED, ssObjChanged2);
    var ssRootChanged = function(e) {
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
      equal(e.events[0].type, 'text_inserted');
    };
    doc.getModel().getRoot().get('map').get('mapwithsub').addEventListener(
      rdm.EventType.OBJECT_CHANGED,
      ssMapChanged);
    var ssSubMapChanged = function(e) {
      equal(e.events[0].type, 'text_inserted');
    };
    doc.getModel().getRoot().get('map').get('mapwithsub').get('submap').addEventListener(
      rdm.EventType.OBJECT_CHANGED,
      ssSubMapChanged);
    var ssSubSubMapChanged = function(e) {
      equal(e.events[0].type, 'text_inserted');
    };
    doc.getModel().getRoot().get('map').get('mapwithsub').get('submap').get('subsubmap').addEventListener(
      rdm.EventType.OBJECT_CHANGED,
      ssSubSubMapChanged);
    var ssStringChanged = function(e) {
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
      equal(e.events[0].type, 'value_changed');
    };
    map1.addEventListener(rdm.EventType.OBJECT_CHANGED, ssMap1);
    var ssMap2 = function(e) {
      equal(e.events[0].type, 'value_changed');
    };
    map2.addEventListener(rdm.EventType.OBJECT_CHANGED, ssMap2);
    var ssMap = function(e) {
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
