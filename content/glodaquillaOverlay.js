/*
 ***** BEGIN LICENSE BLOCK *****
 * This file is part of the application GlodaQuilla by Mesquilla.
 *
 * This application is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * You should have received a copy of the GNU General Public License
 * along with this application.  If not, see <http://www.gnu.org/licenses/>.
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is Mesquilla code.
 *
 * The Initial Developer of the Original Code is
 * Kent James <rkent@mesquilla.com>
 * Portions created by the Initial Developer are Copyright (C) 2009
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *
 * ***** END LICENSE BLOCK *****
 */

Components.utils.import("resource://app/modules/gloda/datamodel.js");
Components.utils.import("resource://app/modules/gloda/gloda.js");
Components.utils.import("resource://app/modules/gloda/indexer.js");
Components.utils.import("resource://app/modules/gloda/index_msg.js");
Components.utils.import("resource://glodaquilla/GlodaQuillaIndexerOverlay.jsm");

Components.utils.import("resource://glodaquilla/inheritedPropertiesGrid.jsm");

const glodaquillaStrings = Components.classes["@mozilla.org/intl/stringbundle;1"]
                             .getService(Components.interfaces.nsIStringBundleService)
                             .createBundle("chrome://glodaquilla/locale/glodaquilla.properties");

var glodaDoIndex = {
  defaultValue: function defaultValue(aFolder) {
    Components.utils.import("resource:///modules/gloda/datastore.js");
    Components.utils.import("resource:///modules/gloda/datamodel.js");

    // aFolder can be either an nsIMsgIncomingServer or an nsIMsgFolder
    if (aFolder instanceof Components.interfaces.nsIMsgIncomingServer)
      return (aFolder.type != "nntp");

    // get the default value from gloda
    let defaultPriority = GlodaDatastore.getDefaultIndexingPriority(aFolder);
    return (defaultPriority != GlodaFolder.prototype.kIndexingNeverPriority);
  },
  name: glodaquillaStrings.GetStringFromName("indexInGlobalDatabase"),
  accesskey: glodaquillaStrings.GetStringFromName("indexInGlobalDatabase.accesskey"),
  property: "glodaDoIndex",
  hidefor: "nntp"
};

var columnHandlerGlodaDirty = {
   getCellText:         function(row, col) {
      // get the message's header so that we can extract the field
      var key = gDBView.getKeyAt(row);
      var hdr = gDBView.getFolderForViewIndex(row).GetMessageHeader(key);
      return hdr.getStringProperty("gloda-dirty");
   },
   getSortStringForRow: function(hdr) {
       return null;},
   isString:            function() {return false;}, // will sort using integers
   getCellProperties:   function(row, col, props){},
   getImageSrc:         function(row, col) {return null;},
   getSortLongForRow:   function(hdr) {
     // sort nulls first, by adding 1 to the value
     if (hdr.getStringProperty("gloda-dirty") == null) {return 0;}
     return 1 + parseInt(hdr.getStringProperty("gloda-dirty"));
   },
   getRowProperties:    function(index, properties) {return null;}
};

var columnHandlerOffline = {
  getCellText:         function(row, col) {
    return null;
  },
  getSortStringForRow: function(hdr) {
    var kMsgFlagOffline = 0x0080;
    var isOffline = hdr.flags & kMsgFlagOffline;
    if (!isOffline && hdr.folder.flags & 0x00002001)
      return "1";
    else
      return "0";
  },
  isString:            function() {return true;},
  getCellProperties:   function(row, col, props){},
  getImageSrc:         function(row, col) {
    var key = gDBView.getKeyAt(row);
    var hdr = gDBView.getFolderForViewIndex(row).GetMessageHeader(key);
    var kMsgFlagOffline = 0x0080;
    var isOffline = hdr.flags & kMsgFlagOffline;
    if (!isOffline && hdr.folder.flags & 0x00002001)
      return "chrome://glodaquilla/skin/unclassified.png";
    else
      return "chrome://glodaquilla/skin/good.png";
  },
  getSortLongForRow:   function(hdr) { return null;},
  getRowProperties:    function(index, properties) {return null;},
  cycleCell:           function(row, col) {}
};

var columnHandlerGlodaId = {
  getCellText:         function(row, col) {
    var key = gDBView.getKeyAt(row);
    var hdr = gDBView.getFolderForViewIndex(row).GetMessageHeader(key);
    return hdr.getStringProperty("gloda-id");
  },
  getSortStringForRow: function(hdr) {
    return hdr.getStringProperty("gloda-id");
  },
  isString:            function() {return true;},
  getCellProperties:   function(row, col, props){},
  getImageSrc:         function(row, col) {},
  getSortLongForRow:   function(hdr) { return null;},
  getRowProperties:    function(index, properties) {return null;},
  cycleCell:           function(row, col) {}
};

function addGlodaquillaCustomColumnHandler() {
  if (gDBView)
  {
    gDBView.addColumnHandler("colOffline", columnHandlerOffline);
    gDBView.addColumnHandler("colGlodaId", columnHandlerGlodaId);
    gDBView.addColumnHandler("colGlodaDirty", columnHandlerGlodaDirty);
  }
};

window.addEventListener("load", doGlodaquillaOnceLoaded, false);

function doGlodaquillaOnceLoaded() {
  const Cc = Components.classes;
  const Ci = Components.interfaces;

  let rootprefs = Cc["@mozilla.org/preferences-service;1"]
                     .getService(Ci.nsIPrefService)
                     .getBranch("");
  let disableFolderProps = false;
  try {
    disableFolderProps = rootprefs.getBoolPref("extensions.glodaquilla.disableFolderProps");
  } catch (e) {}

  if (!disableFolderProps)
    InheritedPropertiesGrid.addPropertyObject(glodaDoIndex);

  var ObserverService = Components.classes["@mozilla.org/observer-service;1"]
                                  .getService(Components.interfaces.nsIObserverService);
  ObserverService.addObserver(CreateGlodaquillaDbObserver, "MsgCreateDBView", false);
  CreateGlodaquillaDbObserver.observe(msgWindow.openFolder, null, null);

  // override the gloda indexer to adjust which folders are indexed
  GlodaFolder.prototype.__defineGetter__("indexingPriority", function getIndexingPriority() {

    let returnValue = this._indexingPriority;
    // Just give the usual value if inherited properties are disabled
    let rootprefs = Cc["@mozilla.org/preferences-service;1"]
                      .getService(Ci.nsIPrefService)
                      .getBranch("");
    let disableFolderProps = false;
    try {
     disableFolderProps = rootprefs.getBoolPref("extensions.glodaquilla.disableFolderProps");
    } catch (e) {}
    if (disableFolderProps)
      return returnValue;

    // If we are using inherited properties, we will use the default for
    //  the folder as the base value
    try {
      let msgFolder = this.getXPCOMFolder();
      let defaultPriority = GlodaDatastore.getDefaultIndexingPriority(msgFolder);
      let glodaFolder = this;
      let override = msgFolder.getInheritedStringProperty("glodaDoIndex");
      // watchout for nulls
      if (!override)
        override = "";
      let oldOverride = msgFolder.getInheritedStringProperty("glodaquillaDoIndexOld");
      if (!oldOverride)
        oldOverride = "";
      try {
        if (override != oldOverride) {
          // fix gloda's view of the folder
          if (override == "false") {
            // stop doing so
            if (this.indexing)
              GlodaIndexer.killActiveJob();
            // mark all existing messages as deleted
            this._datastore.markMessagesDeletedByFolderID(glodaFolder.id);
            // re-index
            GlodaMsgIndexer.indexingSweepNeeded = true;
          }
          else {
            glodaFolder._dirtyStatus = glodaFolder.kFolderFilthy;
            this._datastore.updateFolderDirtyStatus(glodaFolder)
            GlodaMsgIndexer.indexingSweepNeeded = true;
          }
          msgFolder.setStringProperty("glodaquillaDoIndexOld", override);
        }
      } catch (e) {dump(e) + '\n';} // For reliability, ignore errors
        
      if (override == "false")
        returnValue = this.kIndexingNeverPriority;
      else if (override == "true")
        returnValue =  Math.max(this.kIndexingDefaultPriority, returnValue);
    } catch (e) {dump(e) + '\n';}
    return returnValue;
  });
};

var CreateGlodaquillaDbObserver = {
  // Components.interfaces.nsIObserver
  observe: function(aMsgFolder, aTopic, aData)
  {
     addGlodaquillaCustomColumnHandler();
  }
};

(function glodaquilla()
{
  // local shorthand for the global reference
  this.glodaquilla = {};
  let self = this.glodaquilla;


  const Cc = Components.classes;
  const Ci = Components.interfaces;
  const Cu = Components.utils;

  Cu.import("resource:///modules/iteratorUtils.jsm");
  Cu.import("resource:///modules/gloda/gloda.js");
  Cu.import("resource:///modules/gloda/datastore.js");

  // module-level variables
  const kSyncFirstRun = 1;
  const kSyncDisabledInheritedProperties = 2;
  const kSyncEnabledInheritedProperties = 3;
  
  // preferences
  self.PREF_DisableFolderProps = "extensions.glodaquilla.disableFolderProps";

  // global scope variables
  self.onLoad = function onLoad(e)
  {
    let prefs = Cc["@mozilla.org/preferences-service;1"]
                  .getService(Ci.nsIPrefBranch2);
    prefs.addObserver(self.PREF_DisableFolderProps, self, false);
    self.syncProperties();
  },

  self.onUnload = function onUnload(e)
  {
    let prefs = Cc["@mozilla.org/preferences-service;1"]
                  .getService(Ci.nsIPrefBranch2);
    prefs.removeObserver(self.PREF_DisableFolderProps, self);
  };

  self.observe = function observe(aSubject, aTopic, aData)
  {
    if (aTopic == "nsPref:changed")
    { 
      //let prefs = Cc["@mozilla.org/preferences-service;1"]
      //              .getService(Ci.nsIPrefBranch);
      let prefs = aSubject.QueryInterface(Ci.nsIPrefBranch)
      dump('qi-d subject is ' + prefx + '\n');
      if (aData == self.PREF_DisableFolderProps)
      {
        dump('pref extensions.glodaquilla.disableFolderProps\n');
        try {
          disableFolderProps = prefs.getBoolPref(self.PREF_DisableFolderProps);
          dump('disableFolderProps is ' + disableFolderProps + '\n');
          if (disableFolderProps)
          {
            dump('Disable folder props\n');
            // this is a new function
            if (typeof InheritedPropertiesGrid.removePropertyObject != "undefined")
              InheritedPropertiesGrid.removePropertyObject(glodaDoIndex);
          }
          else
            InheritedPropertiesGrid.addPropertyObject(glodaDoIndex);
        } catch (e) {dump (e) + '\n';}
        self.syncProperties();
        /*
        try {
          disableFolderProps = prefs.getBoolPref(self.PREF_DisableFolderProps);
          if (disableFolderProps)
            self.syncProperties(kSyncDisabledInheritedProperties);
          else
            self.syncProperties(kSyncEnabledInheritedProperties);
            InheritedPropertiesGrid.addPropertyObject(glodaDoIndex)
        } catch (e) {dump (e) + '\n';}
        */
      }
    }
  };

  /**
   * Synchronize TB 3.1's new indexingPriority folder property with
   *  glodaquilla's glodaDoIndex property.
   *
   * The basic idea is this: We would like people to be able to switch back and
   *  forth between using inherited properties or not. When you enable
   *  inherited properties, then all subfolders of folders with "indexingPriority"
   *  set to kIndexingNeverPriority will inherit.
   *
   * I appears to me that dmose's indexingPriority gets set on each folder, which
   *  makes it unsuitable for use as an inherited property. So I will maintain both
   *  glodaquilla's glodaDoIndex as an inherited property, as well as dmose's
   *  indexingPriority.
   *
   */
  self.syncProperties = function syncProperties()
  {

    const accountManager = Cc["@mozilla.org/messenger/account-manager;1"]
                             .getService(Ci.nsIMsgAccountManager);
    const kIndexingNeverPriority = -1;
    const kNone = -2;
    const kUnchanged = -3;
    // loop over all folders
    let servers = accountManager.allServers;

    for each (var server in fixIterator(servers, Ci.nsIMsgIncomingServer))
    {
      let rootFolder = server.rootFolder;
      let allFolders = Cc["@mozilla.org/supports-array;1"]
                         .createInstance(Ci.nsISupportsArray);
      rootFolder.ListDescendents(allFolders);
      let numFolders = allFolders.Count();
      for each (let folder in fixIterator(allFolders, Ci.nsIMsgFolder))
      {
        let glodaFolder  = GlodaDatastore._mapFolder(folder);
        indexingPriority = glodaFolder._indexingPriority;
        let glodaDoIndex = folder.getStringProperty("glodaDoIndex");
        dump(' folder: ' + folder.name + ' glodaDoIndex: ' + glodaDoIndex + ' indexingPriority: '
             + indexingPriority + '\n');

        let changedGlodaDoIndex = "notchanged";
        let changedIndexingPriority = kUnchanged;
        /**
         * On first run, we will first copy the existing gloda
         *  properties into the new indexingPriority properties.
         *  This is to help maintain similar behavior if glodaquilla
         *  is disabled. But then we will also copy the
         *  indexingPriority property back to glodaquilla, so that
         *  when glodaquilla is first installed, its inherited
         *  properties will also disable any folders that are disabled
         *  by the core.
         */

        // Propagate glodaquilla property to core
          if (glodaDoIndex == "false")
            changedIndexingPriority = kIndexingNeverPriority;

        // Propagate core to glodaquilla
          if (indexingPriority == kIndexingNeverPriority)
            changedGlodaDoIndex = "false";

        // update properties if needed
        if (changedGlodaDoIndex != "notchanged" &&
            changedGlodaDoIndex != glodaDoIndex)
        {
          dump('set glodaDoIndex to ' + changedGlodaDoIndex + ' folder ' + folder.name + '\n');
          folder.setStringProperty("glodaDoIndex", changedGlodaDoIndex);
        }
        if (changedIndexingPriority != kUnchanged &&
            changedIndexingPriority != indexingPriority)
        {
          dump('set indexingPriority to ' + changedIndexingPriority + ' folder ' + folder.name + '\n');
          Gloda.setFolderIndexingPriority(folder, changedIndexingPriority);
        }
      }
    }
  }

})();

window.addEventListener("load", function(e) { glodaquilla.onLoad(e); }, false);
window.addEventListener("unload", function(e) { glodaquilla.onUnload(e); }, false);
