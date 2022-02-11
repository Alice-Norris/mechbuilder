const { systemPreferences } = require("electron");
const path = require("path");
const fs = require("fs/promises");
const { mech } = require("./mechClass");
const Parser = new DOMParser();
var currentMechDef = null;
var currentMech;

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
    for (select of document.getElementsByClassName("componentSelect")){
        clearSelectBox(select);
        for (component of currentMech.structure){
            let componentRegex = new RegExp(select.id)
            if (componentRegex.test(component.location) === true) {
                for (attachment of component.attachments){
                    let newOpt = document.createElement("option");
                    newOpt.text = attachment;
                    select.appendChild(newOpt);
                }
                select.setAttribute("size", select.children.length);  
                select.parentElement.setAttribute("class", "components");
            };
        };
    };
    let weaponForm = document.getElementById("weaponSelectForm");
    for (component of currentMech.structure){
        if (component.hardpoints.length > 0){
            
            //create fieldset for component with hardpoints
            componentFieldset = document.createElement("fieldset");
            //create legend for component with hardpoints
            componentLegend = document.createElement("Legend");
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
