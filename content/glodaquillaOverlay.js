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

Components.utils.import("resource://app/modules/gloda/indexer.js");
Components.utils.import("resource://app/modules/gloda/gloda.js");
Components.utils.import("resource://glodaquilla/GlodaQuillaIndexerOverlay.jsm");

Components.utils.import("resource://glodaquilla/inheritedPropertiesGrid.jsm");

const glodaquillaStrings = Components.classes["@mozilla.org/intl/stringbundle;1"]
                             .getService(Components.interfaces.nsIStringBundleService)
                             .createBundle("chrome://glodaquilla/locale/glodaquilla.properties");

var glodaDoIndex = {
  defaultValue: function defaultValue(aFolder) {
    // aFolder can be either an nsIMsgIncomingServer or an nsIMsgFolder
    let server;
    if (aFolder instanceof Components.interfaces.nsIMsgIncomingServer)
      server = aFolder;
    else
      server = aFolder.server;
    return (server.type != "nntp");
  },
  name: glodaquillaStrings.GetStringFromName("indexInGlobalDatabase"),
  accesskey: glodaquillaStrings.GetStringFromName("indexInGlobalDatabase.accesskey"),
  property: "glodaDoIndex",
  hidefor: "nntp"
};

InheritedPropertiesGrid.addPropertyObject(glodaDoIndex);

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
}


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
}

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
}

function addGlodaquillaCustomColumnHandler() {
  if (gDBView)
  {
    gDBView.addColumnHandler("colOffline", columnHandlerOffline);
    gDBView.addColumnHandler("colGlodaId", columnHandlerGlodaId);
    gDBView.addColumnHandler("colGlodaDirty", columnHandlerGlodaDirty);
  }
}

window.addEventListener("load", doGlodaquillaOnceLoaded, false);

function doGlodaquillaOnceLoaded() {
  var ObserverService = Components.classes["@mozilla.org/observer-service;1"]
                                  .getService(Components.interfaces.nsIObserverService);
  ObserverService.addObserver(CreateGlodaquillaDbObserver, "MsgCreateDBView", false);
  CreateGlodaquillaDbObserver.observe(msgWindow.openFolder, null, null);

  // Do we have bug 523649? If not, override indexer shouldIndexFolder
  if ( Gloda.shouldIndexFolder === undefined)
  {
    // override the gloda indexer to adjust which folders are indexed
    GlodaIndexer.shouldIndexFolder = GlodaQuillaIndexerOverlay.shouldIndexFolder;
    GlodaIndexer.shouldIndexFolder(null);
  }
}

var CreateGlodaquillaDbObserver = {
  // Components.interfaces.nsIObserver
  observe: function(aMsgFolder, aTopic, aData)
  {
     addGlodaquillaCustomColumnHandler();
  }
}
