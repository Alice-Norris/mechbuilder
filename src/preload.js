const { systemPreferences } = require("electron");
const path = require("path");
const fs = require("fs/promises");
const { mech } = require("./mechClass");
const Parser = new DOMParser();
var currentMechDef = null;
var currentMech;

async function addMechChassis() {
        try{
            var directoryPath = path.join(__dirname, '..\\assets\\cdf\\stock\\');
            var chassis_array = await fs.readdir(directoryPath, { withFileTypes: false});
            var mechSelect = document.getElementById("mech");
            for (fileName of chassis_array){
                let opt = document.createElement('option');
                opt.setAttribute('class', 'formOption');
                opt.innerText = path.parse(fileName).name;
                opt.value = fileName;
                mechSelect.appendChild(opt);
            }
        } catch (err) {
                console.error(err);
        }
    }
    
async function addSubtypes(event) {
    //get mechChassis select control, get te
    var mechChoice = event.target.options[event.target.selectedIndex].text
    var subtypeSelect = document.getElementById("subtype");
    var subtypeChoice = subtypeSelect.options[subtypeSelect.selectedIndex].text;
    currentMech = new mech(mechChoice, subtypeChoice);
    clearSelectBox(subtypeSelect);
    //create and add default option
    var defaultOpt = document.createElement("option")
    defaultOpt.value = "default";
    defaultOpt.innerText = " ——— VARIANT NAME ———"
    defaultOpt.disabled = true;
    defaultOpt.selected = true;
    subtypeSelect.appendChild(defaultOpt);
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
    var subtypeSelect = document.getElementById("subtype");
    var subtypeChoice = subtypeSelect.options[subtypeSelect.selectedIndex]
    var fileName = subtypeChoice.value;
    var chassisName = currentMech.chassis;
    console.log(currentMech.chassis);
    currentMech.subtype = subtypeChoice.text;
    await currentMech.readMdfFile();
    for (select of document.getElementsByClassName("componentSelect")){
        let component = currentMech.structure.find(component => {return component.name === select.getAttribute("name")})
        for (attachment of component.attachments){
             let newOpt = document.createElement("option");
             newOpt.value = attachment;
             newOpt.innerText = attachment;
             newOpt.selected = 'true';
             newOpt.setAttribute('class', 'formOption');
             select.appendChild(newOpt);
         }
    };
    for (hardpoint of currentMech.hardpoints){
        console.log(hardpoint);
    }
    // let directoryPath = path.join(__dirname, '..\\assets\\mdf\\', chassisName, fileName);
    // mechFileData = await fs.readFile(directoryPath, 'utf-8');
    // currentMechDef = jquery(jquery.parseXML(mechFileData));
    // //let components = currentMechDef.find("Component[Name='centre_torso'] > Piece > Attachment");
    // for (select of document.getElementsByClassName("componentSelect")){
    //     clearSelectBox(select);
    //     let component = currentMechDef.find("Component[Name*='" + select.name + "'] > Piece > Attachment");      
    //     component.each(function(index) {
    //         let newOpt = document.createElement("option");
    //         let attachmentName = jquery(component.get(index), "Attachment").attr("AName");
    //         newOpt.value = attachmentName;
    //         newOpt.innerHTML = attachmentName;
    //         newOpt.selected = 'true';
    //         newOpt.setAttribute('class', 'formOption');
    //         select.appendChild(newOpt);
    //         select.setAttribute('size', component.length);
    //     })
    // };
}
function clearSelectBox(select){
    while (select.firstChild){
        select.removeChild(select.lastChild);
    }
}
function scriptSetup(){
    addMechChassis();
    document.getElementById("mech").addEventListener('input', addSubtypes);
    document.getElementById("subtype").addEventListener('input', autoFillParts);
}

window.addEventListener('DOMContentLoaded', scriptSetup);
