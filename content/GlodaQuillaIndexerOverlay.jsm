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

var EXPORTED_SYMBOLS = ["GlodaQuillaIndexerOverlay"];

const Cc = Components.classes;
const Ci = Components.interfaces;

var GlodaQuillaIndexerOverlay = {

  shouldIndexFolder: function(aMsgFolder) {
    if (!aMsgFolder)
      return false;

    // check the inherited folder property to override indexing
    let glodaDoIndex = aMsgFolder.getInheritedStringProperty("glodaDoIndex");
    if (glodaDoIndex == "false")
    {
      return false;
    }
    let folderFlags = aMsgFolder.flags;
    // only index mail folders but stay out of virtual folders
    return ((folderFlags & Ci.nsMsgFolderFlags.Mail) &&
            !(folderFlags & Ci.nsMsgFolderFlags.Virtual));
  },
}
