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

 // folder properties overlay. Unfortunately there are not adequate ids in the
 // filter properties xul to make a normal overlay possible, so instead we have
 // to add our xul dynamically.

// Make sure that only the first load of this module, by global name, is loaded
if (typeof InheritedPropertiesGrid == "undefined")
{
  Components.utils.import("resource://glodaquilla/inheritedPropertiesGrid.jsm");
  InheritedPropertiesGrid.setStrings(
    Components.classes["@mozilla.org/intl/stringbundle;1"]
                      .getService(Components.interfaces.nsIStringBundleService)
                      .createBundle("chrome://glodaquilla/locale/mesquilla.properties"));
}
 
(function()
{
  // global scope variables
  this.glodaquillaFolderProps = {};

  // local shorthand for the global reference
  let self = this.glodaquillaFolderProps;

  // module-level variables
  const Cc = Components.classes;
  const Ci = Components.interfaces;

  const glodaquillaStrings = Cc["@mozilla.org/intl/stringbundle;1"]
                               .getService(Ci.nsIStringBundleService)
                               .createBundle("chrome://glodaquilla/locale/glodaquilla.properties");

  let folder; // nsIMsgFolder passed to the window

  // standard format for inherited property rows
  //   defaultValue:  value if inherited property missing (boolean true or false)
  //   name:          localized display name
  //   property:      inherited property name
  let glodaDoIndex = {
    defaultValue: function defaultValue(aFolder) {
      // aFolder can be either an nsIMsgIncomingServer or an nsIMsgFolder
      let server;
      if (aFolder instanceof Ci.nsIMsgIncomingServer)
        server = aFolder
      else
        server = aFolder.server;
      return (server.type != "nntp");
    },
    name: glodaquillaStrings.GetStringFromName("glodaquilla.indexInGlobalDatabase"),
    property: "glodaDoIndex"
  };

  self.onLoad = function onLoad(e)
  {
    folder = window.arguments[0].folder;

    // Setup UI for the "glodaDoIndex" inherited property, but only for
    //  imap or local folders (which includes rss).
    if (!(folder instanceof Ci.nsIMsgLocalMailFolder) &&
        !(folder instanceof Ci.nsIMsgImapMailFolder))
      return;

    window.gInheritTarget = folder;
    if (typeof(gInheritPropertyObjects) == "undefined")
      window.gInheritPropertyObjects = [];
    gInheritPropertyObjects.push(glodaDoIndex);

    // create or get the rows from the inherit grid
    let rows = InheritedPropertiesGrid.getInheritRows(document);
    let row = InheritedPropertiesGrid.createInheritRow(glodaDoIndex, folder, document);
    if (row)  // false means another extension is handling this, so quit
    {
      rows.appendChild(row);
      // extend the ondialogaccept attribute
      let dialog = document.getElementsByTagName("dialog")[0];
      dialog.setAttribute("ondialogaccept", "glodaquillaFolderProps.onAcceptInherit();" + 
                          dialog.getAttribute("ondialogaccept"));
    }
  };

  self.onAcceptInherit = function glodaDoIndexOnAcceptInherit()
  {
    InheritedPropertiesGrid.onAcceptInherit(glodaDoIndex, folder, document);
  }

})();

window.addEventListener("load", function(e) { glodaquillaFolderProps.onLoad(e); }, false);
