Realtime Data Model
==========================

This project is a library that constrains the Google Drive Realtime API and provides a local implementation so that applications can write to a single API whether the backing data is a Google Document or a local object.

It is based on [Google Drive Realtime](https://developers.google.com/drive/realtime/).

## Usage ##
To use this library in your code :

* Download a compiled release at (https://github.com/r/sirctseb/realtime-data-model-js/releases) and include rdm.js in your project.

* Follow the steps described at [Create a Realtime Application](https://developers.google.com/drive/realtime/application) or begin using the library locally with:

```javascript
rdm.start(realtimeOptions, local: true);
```

The library is currently unstable and does not support custom objects or databinding.

## License ##
Apache 2.0
