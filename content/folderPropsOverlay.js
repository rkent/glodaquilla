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

Components.utils.import("resource://glodaquilla/inheritedPropertiesGrid.jsm");
 
(function()
{
  // global scope variables
  this.glodaquillaFolderProps = {};

  // local shorthand for the global reference
  let self = this.glodaquillaFolderProps;

  // module-level variables
  const Cc = Components.classes;
  const Ci = Components.interfaces;
  const Cu = Components.utils;

  let folder; // nsIMsgFolder passed to the window

  self.onLoad = function onLoad(e)
  {
    // We won't add anything if glodaquilla properties are disabled
    let prefs = Cc["@mozilla.org/preferences-service;1"]
                  .getService(Ci.nsIPrefBranch);
    let disableFolderProps = false;
    try {
      disableFolderProps = prefs.getBoolPref("extensions.glodaquilla.disableFolderProps");
    } catch (e) {}

    dump('disableFolderProps is ' + disableFolderProps + '\n');
    if (disableFolderProps)
    {
      /**
       * There may be existing ...
       */
      return;
    }

    let standardItem = document.getElementById('folderIncludeInGlobalSearch');
    standardItem.setAttribute("hidden", "true");
    // Setup UI for the "glodaDoIndex" inherited property, but only for
    //  imap or local folders (which includes rss).
    folder = window.arguments[0].folder;
    if (!(folder instanceof Ci.nsIMsgLocalMailFolder) &&
        !(folder instanceof Ci.nsIMsgImapMailFolder))
      return;

    window.gInheritTarget = folder;

    // create or get the rows from the inherit grid
    dump("folderProps getInheritRows\n");
    let rows = InheritedPropertiesGrid.getInheritRows(document);
    let row = InheritedPropertiesGrid.createInheritRow("glodaDoIndex", folder, document);
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
    InheritedPropertiesGrid.onAcceptInherit("glodaDoIndex", folder, document);
  };


})();

window.addEventListener("load", function(e) { glodaquillaFolderProps.onLoad(e); }, false);
