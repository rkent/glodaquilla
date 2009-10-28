/*
 ***** BEGIN LICENSE BLOCK *****
 * This file is part of an application by Mesquilla.
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

/**
 * InheritedPropertiesGrid: User interface for setting inherited folder properties
 */

var EXPORTED_SYMBOLS = ["InheritedPropertiesGrid"];

const Cc = Components.classes;
const Ci = Components.interfaces;

var InheritedPropertiesGrid = {

  // this is needed because we may include this module with different extensions,
  // each of which will have their own chrome path to the needed strings.
  setStrings: function setStrings(aMesquillaStrings)
  {
    this._strings = aMesquillaStrings;
  },

  _strings: null,

  // Create or get a 3-column grid to describe inherited variables for the
  //  folder properties xul. Account Manager uses an overlay.
  getInheritRows: function getInheritRows(document)
  {
    /* this is what we are creating, and adding to the GeneralPanel
    <vbox id="inheritBox">
      <grid>
        <columns>
          <column/>
          <column/>
          <column/>
        </columns>
          <column flex="1"/>
        <rows id="inheritRows">
          <row>
            <label value=" " />
            <label value="Enabled" />
            <label value="Inherit" />
          </row>
          <label value=" "/>
        </rows>
      </grid>
    </vbox>

    */

    // Check if it already exists, perhaps added by another extension.
    let rows = document.getElementById("inheritRows");
    if (rows)
      return rows;

    // create new vbox
    let inheritBox = document.createElement("vbox");
    inheritBox.setAttribute("id", "inheritBox");

    // now append into the existing xul
    document.getElementById("GeneralPanel")
            .appendChild(inheritBox);

    // create the grid and its children
    let grid = document.createElement("grid");
    let columns = document.createElement("columns");
    grid.appendChild(columns);

    // add three columns
    let nameColumn = document.createElement("column");
    columns.appendChild(nameColumn);

    let enabledColumn = document.createElement("column");
    columns.appendChild(enabledColumn);

    let inheritColumn = document.createElement("column");
    columns.appendChild(inheritColumn);
 
    let flexColumn = document.createElement("column");
    flexColumn.setAttribute("flex", "1");
    grid.appendChild(flexColumn);

    rows = document.createElement("rows");
    rows.setAttribute("id", "inheritRows");
    grid.appendChild(rows);

    // add column headers as the first row
    let row = document.createElement("row");

    let label1 = document.createElement("label");
    label1.setAttribute("value", " ");
    row.appendChild(label1);

    let label2 = document.createElement("label");
    label2.setAttribute("value", this._strings.GetStringFromName("mesquilla.enabled"));
    row.appendChild(label2);

    let label3 = document.createElement("label");
    label3.setAttribute("value", this._strings.GetStringFromName("mesquilla.inherit"));
    row.appendChild(label3);

    rows.appendChild(row);

    // add it all to the panel
    inheritBox.appendChild(grid);
    return rows;
  },

  /** create a row element for an inherited property on the account manager
   * @param aPropertyObject  descriptor for the inherited property, with these fields:
   *
   *                         default:  value if no inherited property found (boolean)
   *                         name:     localized description of the property (string)
   *                         property: inherited property (string)
   *                         hidefor:  server types to hide the property
   *
   * @param aFolder  either an nsIMsgFolder or nsIMsgIncomingServer as the target of
   *                 the inherited property
   *
   * @param document DOM document
   * @param aIsAccountManager  true if row in account manager
   */

  createInheritRow: function createInheritRow(aPropertyObject, aFolder, document, aIsAccountManager)
  { try {

    /* We are creating this:

       <row hidefor="<hidefor>" id="property-<property>">
         <label value="<aName>" />
         <hbox pack="center">
           <checkbox id="enable-"+property
                     oncommand="InheritedPropertiesGrid.onCommandEnable(
            '<property>' ,gInheritTarget, document, (parent.)gInheritPropertyObjects);" />
         </hbox>
         <hbox pack="center">
           <checkbox id="inherit-"+property
                     oncommand="InheritedPropertiesGrid.onCommandInherit(
            '<property>' ,gInheritTarget, document, (parent.)gInheritPropertyObjects);" />
         </hbox>
         <text id="server.<property>"
               inheritProperty="<property>"
               wsm_persist="true"
               prefstring="mail.server.%serverkey%.<property>"
               preftype="string"
               genericattr="true"
               hidden="true" />
       </row>

       AccountManager.js gives special handling to a tag of type "text" that we
        take advantage of here. The "value" attribute will contain a string
        "true" or "false" when an inherited boolean is defined.
    */

    let property = aPropertyObject.property;

    let row = document.getElementById("property-" + property);
    if (row) // perhaps another extension already added this
      return null;
    row = document.createElement("row");
    row.setAttribute("id", "property-" + property);
    if (aIsAccountManager && aPropertyObject.hidefor)
      row.setAttribute("hidefor", aPropertyObject.hidefor);

    let label = document.createElement("label");
    label.setAttribute("value", aPropertyObject.name);
    row.appendChild(label);

    // In the account manager, gInheritPropertyObjects is defined
    //  on the parent window.
    let parentPrefix = aIsAccountManager ? "parent." : "";
    let enableHbox = document.createElement("hbox");
    enableHbox.setAttribute("pack", "center");
    let enableCheckbox = document.createElement("checkbox");
    enableCheckbox.setAttribute("id", "enable-" + property);
    // We only use this in the account manager
    if (aIsAccountManager)
      enableCheckbox.setAttribute("oncommand",
        "InheritedPropertiesGrid.onCommandEnable('" + property + 
        "' ,gInheritTarget, document, " +
        parentPrefix + "gInheritPropertyObjects);");
    enableHbox.appendChild(enableCheckbox);
    row.appendChild(enableHbox);

    let inheritHbox = document.createElement("hbox");
    inheritHbox.setAttribute("pack", "center");
    let inheritCheckbox = document.createElement("checkbox");
    inheritCheckbox.setAttribute("id", "inherit-" + property);
    inheritCheckbox.setAttribute("oncommand",
      "InheritedPropertiesGrid.onCommandInherit('" + property + 
      "' ,gInheritTarget, document, " +
      parentPrefix + "gInheritPropertyObjects);");
    inheritHbox.appendChild(inheritCheckbox);
    row.appendChild(inheritHbox);

    // The account manager gives special treatment to an element of type
    //  "text", which is the treatment that we want.
    let text = document.createElement("text");
    text.setAttribute("id", "server." + property);
    text.setAttribute("hidden", "true");
    if (aIsAccountManager)
    {
      text.setAttribute("wsm_persist", "true");
      text.setAttribute("prefstring", "mail.server.%serverkey%." + property);
      text.setAttribute("preftype", "string");
      text.setAttribute("genericattr", "true");
    }
    row.appendChild(text);

    // set the values of the checkboxes
    // It's not trivial to figure out if a server property is inherited or not.
    // I need to call the underlying server preference to see :( Easier to
    // check the global preference to see if they are equal.
    let isInherited;
    let server;

    // aFolder can be either an nsIMsgIncomingServer or an nsIMsgFolder
    if (aFolder instanceof Ci.nsIMsgIncomingServer)
      server = aFolder
    else if (aFolder.isServer)
      server = aFolder.server;

    let inheritedValue = "";
    if (server)
    {
      inheritedValue = server.getCharValue(property);
      let globalProperty = "mail.server.default." + property;
      let globalValue;
      try {
        var rootprefs = Cc["@mozilla.org/preferences-service;1"]
                          .getService(Ci.nsIPrefService)
                          .getBranch("");
        globalValue = rootprefs.getCharPref(globalProperty);
      }
      catch (e) {}
      isInherited = (inheritedValue == globalValue);
    }
    else
    {
      let folderValue = aFolder.getStringProperty(property);
      if (folderValue && folderValue.length > 0)
        isInherited = false;
      else
        isInherited = true;
      inheritedValue = aFolder.getInheritedStringProperty(property);
    }

    if (isInherited)
      inheritCheckbox.setAttribute("checked", "true");

    let isEnabled = aPropertyObject.defaultValue(aFolder) ? inheritedValue != "false" :
                                                   inheritedValue == "true";

    enableCheckbox.setAttribute("checked", isEnabled ? "true" : "false");
    if (isInherited)
      enableCheckbox.setAttribute("disabled", "true");

    return row;

  } catch (e) {dump("error in createInheritRow: error " + e + "\n");}},

  onCommandInherit: function onCommandInherit(property, aFolder, document, aInheritPropertyObjects)
  { try {

    // find the property object
    let aPropertyObject;
    for (let i = 0; i < aInheritPropertyObjects.length; i++)
    {
      aPropertyObject = aInheritPropertyObjects[i];
      if (aPropertyObject.property == property)
        break;
    }
    if (aPropertyObject.property != property)
      throw ("property " + property + " not found in property object list\n");
    // Whether a property is "enabled" depends on its default, since the
    //  inherited folder property is usually an override. 
    let defaultValue = aPropertyObject.defaultValue(aFolder);

    let elementInherit = document.getElementById("inherit-" + property);
    let elementEnable = document.getElementById("enable-" + property);

    let isInherited = elementInherit.checked;
    elementEnable.setAttribute("disabled", isInherited);

    // The account manager uses the the <text> element's value to manage
    //  persisting the preference.
    let elementText = document.getElementById("server." + property);

    if (isInherited)
    {
      let inheritedValue = defaultValue ? "true" : "false";
      // XXX this does not work if there is a server.default value.  I should
      //  really create a function that does this work.
      if (aFolder.parent)
      {
        inheritedValue = aFolder.parent.getInheritedStringProperty(property);
      }
      let isEnabled = defaultValue ? inheritedValue != "false" :
                                     inheritedValue == "true";
      elementEnable.checked = isEnabled;
      elementText.setAttribute("value", "");
    }
    else
      elementText.setAttribute("value", elementEnable.checked ? "true" : "false");

  } catch (e) {dump("error in onCommandInherit: " + e + "\n");}},

  // this function is only used in the account manager.
  onCommandEnable: function onCommandEnable(property, aFolder, document, aInheritPropertyObjects)
  { try {
    // find the property object
    let aPropertyObject;
    for (let i = 0; i < aInheritPropertyObjects.length; i++)
    {
      aPropertyObject = aInheritPropertyObjects[i];
      if (aPropertyObject.property == property)
        break;
    }
    if (aPropertyObject.property != property)
      throw ("property " + property + " not found in property object list\n");

    let elementEnable = document.getElementById("enable-" + property);
    let isEnabledString = elementEnable.checked ? "true" : "false";

    // The account manager uses the the <text> element's value to manage
    //  persisting the preference.
    let elementText = document.getElementById("server." + property);
    elementText.setAttribute("value", isEnabledString);
  } catch (e) {dump("error in onCommandEnable: " + e + "\n");}},

  // This function does not work with the account manager, which has its
  //  own mechanism for accepting preferences.
  // XXX to do: consider using a string property parameter so that it acts like
  //            the other functions.
  onAcceptInherit: function onAcceptInherit(aPropertyObject, aFolder, document)
  { try {
    let property = aPropertyObject.property;
    let elementInherit = document.getElementById("inherit-" + property);
    let elementEnable = document.getElementById("enable-" + property);

    if (elementInherit.checked)
    {
      if (aFolder.isServer)
      {
        let value = aFolder.server.getCharValue(property);
        if (value && value.length > 0)
          aFolder.server.setCharValue(property, "");
      }
      else
      {
        let value = aFolder.getStringProperty(property);
        if (value && value.length > 0)
          aFolder.setStringProperty(property, "");
      }
    }
    else
    {
      let value = elementEnable.checked ? "true" : "false";
      if (aFolder.isServer)
        aFolder.server.setCharValue(property, value);
      else
        aFolder.setStringProperty(property, value);
    }
  } catch (e) {dump("error in onAcceptInherit: error " + e + "\n");}}
}
