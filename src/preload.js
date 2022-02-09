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
    currentMech = new mech(chassisChoice.text, subtypeChoice.text);
    await currentMech.buildMech();
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
            };
        };
    };
    for (hardpoint of currentMech.hardpoints){
        //console.log(hardpoint);
    }
    
}

function clearSelectBox(select){
    while (select.firstChild){
        select.removeChild(select.lastChild);
    }
}
function scriptSetup(){
    
    document.getElementById("mech").addEventListener('input', addSubtypes);
    document.getElementById("subtype").addEventListener('input', autoFillParts);
}
window.addEventListener('DOMContentLoaded', addMechChassis);    
window.addEventListener('DOMContentLoaded', scriptSetup);
