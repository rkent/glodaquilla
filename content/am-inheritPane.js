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

// Make sure that only the first load of this module, by global name, is loaded
if (typeof InheritedPropertiesGrid == "undefined")
{
  Components.utils.import("resource://glodaquilla/inheritedPropertiesGrid.jsm");
  InheritedPropertiesGrid.setStrings(
    Components.classes["@mozilla.org/intl/stringbundle;1"]
                      .getService(Components.interfaces.nsIStringBundleService)
                      .createBundle("chrome://glodaquilla/locale/mesquilla.properties"));
}

function onPreInit(account, accountValues)
{
  let server = account.incomingServer;
  window.gInheritTarget = server;
  let rows = InheritedPropertiesGrid.getInheritRows(document);
  // Add rows for defined properties. These are defined through overlays on the
  //  parent window into an array gInheritPropertyObjects
  for (let i = 0; i < parent.gInheritPropertyObjects.length; i++)
  {
    let row = InheritedPropertiesGrid.createInheritRow(parent.gInheritPropertyObjects[i],
                                                       server, document, true);
    if (row) // don't add it already exists, probably a prior extension uses it
      rows.appendChild(row);
  }

  let type = parent.getAccountValue(account, accountValues, "server", "type", null, false);
  hideShowControls(type);
}
