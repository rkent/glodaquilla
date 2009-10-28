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

Components.utils.import("resource://gre/modules/XPCOMUtils.jsm");

function inheritPane() {
}

inheritPane.prototype = {
  name: "inheritPane",
  chromePackageName: "glodaquilla", // This should be the extension that
                                    //  contains the am-inheritPane.* files
  showPanel: function(server) {
    return true;
  },

  QueryInterface: XPCOMUtils.generateQI([Components.interfaces.nsIMsgAccountManagerExtension]),
  classDescription: "MesQuilla Inherit Pane Service",
  classID: Components.ID("{f2809396-1cd1-12b2-841b-8e15f007c699}"),
  contractID: "@mozilla.org/accountmanager/extension;1?name=inheritPane",

  _xpcom_categories: [{category: "mailnews-accountmanager-extensions",
                       entry: "mesquilla extension inherit pane"}]
};

function NSGetModule(compMgr, fileSpec) {
  return XPCOMUtils.generateModule([inheritPane]);
}
