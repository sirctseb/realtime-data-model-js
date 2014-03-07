Realtime Data Model
==========================

This project is a library that constrains the Google Drive Realtime API and provides a local implementation so that applications can write to a single API whether the backing data is a Google Document or a local object. It is based on [Google Drive Realtime](https://developers.google.com/drive/realtime/).

## What this library is for ##
This library is for applications that want to provide realtime collaboration in a document editor, but don't want to
require that every document is associated with a Google Doc. For example, if you want to write a rolodex web app, you
might have a data model that looks like:
```javascript
{rolodex: [{name: 'Some One', phone: '1-800-SOME-ONE'}, {name: 'Other One', phone: '1-734-OTHR-ONE'}]}
```
You can add collaborative editing easily with the Google Drive Realtime Api:
```javascript
rolodexApp.nameElement.onChange = function(e) {
  // update the name in the current rolodex entry with the value of the text box
  rolodexApp.doc.getModel().get('rolodex').get(rolodexApp.currentIndex).set('name', e.target.value);
};
```
However, if you want your app to edit a rolodex model that isn't stored in any Google Doc, you would need to add logic everywhere
in your interface:
```javascript
rolodexApp.nameElement.onChange = function(e) {
  // update the name in the current rolodex entry with the value of the text box
  if(rolodexApp.GDriveDocLoaded) {
    rolodexApp.doc.getModel().get('rolodex').get(rolodexApp.currentIndex).set('name', e.target.value);
  } else {
    rolodexApp.localModel['rolodex'][rolodexApp.currentIndex]['name'] = e.target.value;
  }
};
```
We solve this problem by providing an implementation of the Google Drive Realtime Api that does not require any connection
to Google Drive. The interface of this library is identical to the Google Drive Realtime Api with exceptions described below.
You write an app that uses realtime api to store the data model and don't worry about whether the data is local or on Google's servers.

## Differences from Google Drive Realtime Api ##
TODO should we just add a parameter to load instead of having these classes?
TODO except that the local ones theoretically support loading from persistent sources
Library-level functions including gapi.drive.realtime.load have been replaced by methods on subclasses of DocumentProvider.
A DocumentProvider represents the source of a realtime document but are still associated with one document. For example,
a GoogleDocProvider instance loads a realtime document associated with a Google Doc, while a LocalDocumentProvider provides
a local document which doesn't require connecting to Google's services.

### Define functions to handle file loading, initialization, and errors ###
```javascript
var onLoaded = function(doc) {
  // Stuff to be done the when the document is loaded
};

var initializeDoc = function(doc) {
  // Initialize data model the very first time the document is loaded
};

var handleError = function(e) {
  // handle error cases
};
```

### Load a realtime document associated with an existing Google Doc with id FILE_ID ###
```javascript
var gdProvider = new GoogleDocProvider({fileId: FILE_ID});
gdProvider.loadDocument(onLoaded, initializeDoc, handleError);
```

### Create a new Google Doc and load a realtime document ###
```javascript
var gdProvider = new GoogleDocProvider({title: 'New doc title'});
gdProvider.loadDocument(onLoaded, initializeDoc, handleError);
```

### Create a local realtime document, not associated with Google Drive in any way ###
```javascript
var localProvider = new LocalDocumentProvider();
localProvider.loadDocument(onLoaded, initializeDoc, handleError);
```

### Interacting with the document and model ###
The objects passed to the callback functions by a GoogleDocProvider are native gapi.drive.realtime objects.
The objects passed to the callback functions by a LocalDocumentProvider are objects defined by this library and implement
the same interface as the gapi.drive.realtime classes. As a result, client code does not need to know whether an object
came from a GoogleDocProvider or a LocalDocumentProvider.

TODO does this work anyway?
NOTE: This also means you should not determine the type of a collaborative object using instanceof. For example:
```javascript
var obj = model.get('someObject');
console.log(obj instanceof gapi.drive.realtime.CollaborativeList);
```
This can be false either because the object is a CollaborativeString or because it is an instance of the local implementation of a collaborative list.

## Usage ##
To use this library in your code :

* Download a compiled release at https://github.com/r/sirctseb/realtime-data-model-js/releases and include rdm.js in your project.

* Follow the steps described at [Create a Realtime Application](https://developers.google.com/drive/realtime/application) with the exception of loading the document:

```javascript
var docProvider = new GoogleDocProvider({title: 'New doc title'});
// or
var docProvider = new LocalDocumentProvider();
docProvider.loadDocument(onLoaded, initializeDoc, handleError);
```

The library is currently unstable and does not support databinding.

## License ##
Apache 2.0
