/* ***** BEGIN LICENSE BLOCK *****
 *   Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 * 
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is mesquilla.com code.
 *
 * The Initial Developer of the Original Code is
 * Kent James <rkent@mesquilla.com>.
 * Portions created by the Initial Developer are Copyright (C) 2008
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 * 
 * ***** END LICENSE BLOCK ***** */


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
}

var CreateGlodaquillaDbObserver = {
  // Components.interfaces.nsIObserver
  observe: function(aMsgFolder, aTopic, aData)
  {
     addGlodaquillaCustomColumnHandler();
  }
}
