/*
 ***** BEGIN LICENSE BLOCK *****
 * This file is part of GlodaQuilla, Global Database Options, by Mesquilla.
 *
 * This is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * You should have received a copy of the GNU General Public License
 * along with this.  If not, see <http://www.gnu.org/licenses/>.
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
 * Portions created by the Initial Developer are Copyright (C) 2008
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


const glodaquillaStrings = Components.classes["@mozilla.org/intl/stringbundle;1"]
                             .getService(Components.interfaces.nsIStringBundleService)
                             .createBundle("chrome://glodaquilla/locale/glodaquilla.properties");

var glodaDoIndex = {
  defaultValue: function defaultValue(aFolder) {
    // aFolder can be either an nsIMsgIncomingServer or an nsIMsgFolder
    let server;
    if (aFolder instanceof Components.interfaces.nsIMsgIncomingServer)
      server = aFolder
    else
      server = aFolder.server;
    return (server.type != "nntp");
  },
  name: glodaquillaStrings.GetStringFromName("glodaquilla.indexInGlobalDatabase"),
  property: "glodaDoIndex", // inherited property
  hidefor: "nntp"

};

// We add out list of inherited properties to a global array
//  gInheritPropertyObjects.
if (typeof(gInheritPropertyObjects) == "undefined")
  window.gInheritPropertyObjects = [];
gInheritPropertyObjects.push(glodaDoIndex);
 