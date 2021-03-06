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

goog.provide('rdm.GoogleDocProvider');
goog.require('rdm.DocumentProvider');

/**
 * A class to create and load documents from Google Drive
 * @constructor
 */
rdm.GoogleDocProvider = function(options) {
  rdm.DocumentProvider.call(this);
  /**
   * The fileId of the provided document.
   */
  this.fileId = options.fileId || null;
  this.newTitle_ = options.title || null;
};
goog.inherits(rdm.GoogleDocProvider, rdm.DocumentProvider);

/**
 * The client ID of the application. Must be set before loading a document.
 */
rdm.GoogleDocProvider.clientId = null;

rdm.GoogleDocProvider.globallySetup_ = false;

rdm.GoogleDocProvider.prototype.loadDocument = function(onLoaded, opt_initializerFn, opt_errorFn) {
  var this_ = this;
  // check global setup
  rdm.GoogleDocProvider.LoadApi(function(success) {
    if(this_.newTitle_ != null) {
      // insert file
      gapi.client.drive.files.insert({
        'resource': {
          mimeType: 'application/vnd.google-apps.drive-sdk',
          title: this_.newTitle_
        }
      }).execute(function(file) {
        // store id
        this_.fileId = file.id;
        // load realtime doc
        this_.doRealtimeLoad_(onLoaded, opt_initializerFn, opt_errorFn);
      });
    } else {
      // load realtime doc
      this_.doRealtimeLoad_(onLoaded, opt_initializerFn, opt_errorFn);
    }
  });
};

/** @private */
rdm.GoogleDocProvider.prototype.doRealtimeLoad_ = function(onLoaded, opt_initializerFn, opt_errorFn) {
  gapi.drive.realtime.load(this.fileId, onLoaded, opt_initializerFn, opt_errorFn);
};

rdm.GoogleDocProvider.LoadApi = function(callback) {
  if(rdm.GoogleDocProvider.globallySetup_) {
    callback();
    return;
  }
  rdm.GoogleDocProvider.globallySetup_ = true;
  // authenticate
  rdm.GoogleDocProvider.authenticate(function() {
    // load drive api
    rdm.GoogleDocProvider.loadDrive_(function() {
      // load realtime api
      rdm.GoogleDocProvider.loadRealtimeApi_(callback);
    });
  });
};

/** @private */
rdm.GoogleDocProvider.loadDrive_ = function(callback) {
  gapi.client.load('drive', 'v2', callback);
};

/** @private */
rdm.GoogleDocProvider.loadRealtimeApi_ = function(callback) {
  gapi.load('drive-realtime', callback);
};

/**
 * Authenticate to Google Drive
 * @export
 */
rdm.GoogleDocProvider.authenticate = function(callback, immediate) {
  if(rdm.GoogleDocProvider.clientId == null) {
    throw 'clientId not set';
  }

  gapi.load('auth:client', function() {
    if(gapi.auth.getToken() != null) {
      callback();
    }
    var scopes = [
      'https://www.googleapis.com/auth/drive.install',
      'https://www.googleapis.com/auth/drive.file',
      'openid'
    ];
    // if immedate is provided, use that value
    if(immediate != null) {
      gapi.auth.authorize({
        client_id: rdm.GoogleDocProvider.clientId,
        scope: scopes,
        immediate: immediate
      }, function(authResult) {
        // call callback on success
        if(authResult && !authResult.error) {
          callback();
        } else {
          throw authResult;
        }
      });
    } else {
      // if immediate is not provided, try true then false
      gapi.auth.authorize({
        client_id: rdm.GoogleDocProvider.clientId,
        scope: scopes,
        immediate: true
      }, function(authResult) {
        // call callback on success
        if(authResult && !authResult.error) {
          callback();
        } else {
          // otherwise try false
          gapi.auth.authorize({
            client_id: rdm.GoogleDocProvider.clientId,
            scope: scopes,
            immediate: false
          }, function(authResult) {
            // call callback on success
            if(authResult && !authResult.error) {
              callback();
            } else {
              throw authResult;
            }
          });
        }
      })
    }
  });
};

rdm.GoogleDocProvider.prototype.exportDocument = function(onExported) {
  // use drive.realtime.get to get document export
  // gapi.drive.realtime.get({'fileId': this.fileId}).execute(onExported);

  // TODO workaround for bug in client library
  // http://stackoverflow.com/questions/18001043/why-is-the-response-to-gapi-client-drive-realtime-get-empty
  var accessToken = gapi.auth.getToken()['access_token'];
  var xhr = new XMLHttpRequest();
  xhr.open('GET', 'https://www.googleapis.com/drive/v2/files/' + this.fileId + '/realtime', true);
  xhr.setRequestHeader('Authorization', 'Bearer ' + accessToken);
  xhr.onload = function() {
    // onExported(xhr.responseText);
    onExported(JSON.parse(xhr.responseText));
  };
  xhr.onerror = function() {
    // TODO handle error
  };
  xhr.send();
};
