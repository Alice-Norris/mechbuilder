const { systemPreferences } = require("electron");
const path = require("path");
const fs = require("fs/promises");
const { mech } = require("./mechClass");
const { modalAlertManager } = require("./svg");
const Parser = new DOMParser();
var currentMechDef = null;
var currentMech;
var warningDisplayed = false;
var alertManager = null;

async function addMechChassis() {
        try{
            const directoryPath = path.join(__dirname, '..\\assets\\cdf\\stock\\');
            const chassis_array = await fs.readdir(directoryPath, { withFileTypes: false});
            const mechSelect = document.getElementById("mech");
            for (fileName of chassis_array){
                let opt = document.createElement('option');
                opt.setAttribute('class', 'formOption');
                opt.innerText = path.parse(fileName).name;
                opt.value = fileName;
                mechSelect.appendChild(opt);
            }
        } catch (err) {
        }
    }
    
async function addSubtypes(event) {
    //get mechChassis select control, get te
    var mechSelect = document.getElementById("mech");
    var mechChoice = mechSelect.options[mechSelect.selectedIndex].text; 
    var subtypeSelect = document.getElementById("subtype");
    clearSelectBox(subtypeSelect);
    //create and add default option
    subtypeSelect.disabled = false;
    var directoryPath = path.join(__dirname, '..\\assets\\mdf\\', mechChoice +  '\\')
    var  subtype_array = await fs.readdir(directoryPath, {withFileTypes: false});
    for (subtype of subtype_array){
        fileData = await fs.readFile(directoryPath+subtype, 'utf-8');
        let doc = Parser.parseFromString(fileData, 'text/xml').getRootNode();
        let mechVariant = doc.evaluate('string(MechDefinition/Mech/@Variant)', doc)
        let opt = document.createElement('option');
        opt.value = subtype;
        opt.innerText = mechVariant.stringValue
        subtypeSelect.appendChild(opt);
    }

} 

async function autoFillParts(){
    currentMech = null;
    var chassisSelect = document.getElementById("mech");
    var chassisChoice = chassisSelect.options[chassisSelect.selectedIndex];
    var subtypeSelect = document.getElementById("subtype");
    var subtypeChoice = subtypeSelect.options[subtypeSelect.selectedIndex];
    var fileName = subtypeChoice.value;
    currentMech = new mech(chassisChoice.text, subtypeChoice.text, fileName);
    await currentMech.buildMech();
    console.log(currentMech);
    clearSelectBox(document.getElementById("weaponSelectForm"))
    for (fieldset of document.getElementsByClassName("componentFieldset")){
        clearSelectBox(fieldset);
        let componentLegend = document.createElement("legend");
            componentLegend.innerText = fieldset.name + " components";
        for (component of currentMech.structure){
            
            fieldset.appendChild(componentLegend);
            console.log(fieldset.name);
            let componentRegex = new RegExp(fieldset.name)
            if (componentRegex.test(component.location) === true) {
                for (attachment of component.attachments){
                    let checkbox = document.createElement("input");
                    let label = document.createElement("label");
                    let labelDiv = document.createElement("div");
                    let labelSpan = document.createElement("span");
                    labelSpan.innerHTML = attachment;
                    checkbox.checked = true;
                    checkbox.id = attachment;
                    checkbox.type = "checkbox";
                    label.setAttribute("for", attachment);
                    labelDiv.appendChild(checkbox);
                    labelDiv.appendChild(labelSpan);
                    label.appendChild(labelDiv);
                    fieldset.appendChild(label);
                    checkbox.addEventListener('input', checkboxChanged);
                }
                fieldset.style.display = "block";
            };

        };
    };
    let weaponForm = document.getElementById("weaponSelectForm");
    for (component of currentMech.structure){
        if (component.hardpoints.length > 0){
            
            //create fieldset for component with hardpoints
            componentFieldset = document.createElement("fieldset");
            //create legend for component with hardpoints
            let componentLegend = document.createElement("legend");
            componentLegend.innerText = component.location + " hardpoints";
            //add elements to document
            for (hardpointID of component.hardpoints){
                currentHardpoint = currentMech.hardpoints.find(hardpoint => hardpoint["id"] === hardpointID);
                for (let [index, weaponSlot] of currentHardpoint.weaponSlots.entries()){
                    weaponSlotLabel = document.createElement("label")
                    weaponSlotLabel.innerText = "WeaponSlot " + index;
                    weaponSlotLabel.setAttribute("for", "WeaponSlot" + index);
                    componentFieldset.appendChild(weaponSlotLabel);
                    weaponSlotSelect = document.createElement("select");
                    weaponSlotSelect.setAttribute("class", "weaponSelect");
                    weaponSlotSelect.setAttribute("id", component.location + "WeaponSlot" + index);
                    for (weapon of weaponSlot){
                        weaponOption = document.createElement("option")
                        weaponOption.text = weapon["Weapon Name"]
                        weaponOption.value = weapon["Attachment"]
                        weaponSlotSelect.appendChild(weaponOption);
                    }
                    componentFieldset.appendChild(weaponSlotSelect);
                    
                }
            }
            componentFieldset.appendChild(componentLegend);
            weaponForm.appendChild(componentFieldset);
        }
    }
}

function alertManagerSetup() { // Get the modal
    let modalLayer = document.getElementById("modalLayer");
    let btn = document.getElementById("myBtn");
    let closeButton = document.getElementById("cancelPath");
    let modalSVG = document.getElementById("modalSVG");
    alertManager = new modalAlertManager(modalSVG);
    let mechOutline = document.getElementById('mechOutline');
    console.log(mechOutline.contentDocument);
    let mechSVG = mechOutline.contentDocument.getElementById('mechSVG');
    alertManager.setLoadingAnim(mechSVG);
    // Test Button
    btn.addEventListener("pointerup",modalTester);
    // Close Button
    closeButton.addEventListener("pointerup",closeModal);
    // Defocus Close
    window.addEventListener("pointerup",clickParser) 
    console.log(alertManager);
    return alertManager;
  }
  function modalTester(event) {
    console.log(alertManager);
    alertManager.generate(event, "Unsaved Changes!", "You've made changes to this mech that you haven't exported. Would you like to save this mech definition?", true, true, "Save as:", true, "Cancel", testButtons, true, "Save", saveAsDialog);;
  }
  function clickParser(event) {
    //console.log(event.target);
      if (event.target == modalLayer) {
        closeModal();
      }
  }
  function closeModal(){
    console.log(alertManager)
    alertManager.hideModal();
  }
  function testButtons(event){
    console.log("button test triggered");
    alertManager.setButton(1, true, "Close", closeModal);
    alertManager.setButton(2, true, "Change", testFormChange);
    alertManager.setButton(3, true, "Disable", disableButtons);
    alertManager.displayModal(event);
  }
  function testFormChange(event){
    let sampleText = "chaos+nova together 4ever ";
    alertManager.setTitle(sampleText);
    alertManager.setInput(false,"");
    sampleText = sampleText+sampleText;
    sampleText = sampleText+sampleText;
    sampleText = sampleText+sampleText;
    sampleText = sampleText+sampleText;
    sampleText = sampleText+sampleText;
    alertManager.setDescription(sampleText);
    alertManager.setCanEscape(true);
    alertManager.displayModal(event);
  }
  function disableButtons(event){
    alertManager.getButton(1).disable();
    alertManager.getButton(2).disable();
    alertManager.getButton(3).disable();
    alertManager.setInput(false,"");
    alertManager.setCanEscape(true);
    alertManager.displayModal(event);
  }
  function saveAsDialog(){
    /*functionality*/
  }
function checkboxChanged(event){
    if(!warningDisplayed && !event.target.checked){
        alertManager.alert("WARNING!", "", true, event)
    }
}

function clearSelectBox(select){
    while (select.firstChild){
        select.removeChild(select.lastChild);
    }
}

function scriptSetup(){
    document.getElementById("mech").addEventListener('input', addSubtypes);
    document.getElementById("subtype").addEventListener('change', autoFillParts);
}

window.addEventListener('DOMContentLoaded', addMechChassis);    
window.addEventListener('DOMContentLoaded', scriptSetup);
window.addEventListener('load', alertManagerSetup);
