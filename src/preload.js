const { systemPreferences } = require("electron");
const path = require("path");
const fs = require("fs/promises");
const { remove } = require("lodash");
var currentMechDef = null;
var jquery = null;
const Parser = new DOMParser();

const MechChassisFunc = async function addMechChassis() {
        try{
            const directoryPath = path.join(__dirname, '..\\assets\\cdf\\stock\\');
            const chassis_array = await fs.readdir(directoryPath, { withFileTypes: false});
            for (fileName of chassis_array){
                let form = document.getElementById("mech");
                const opt = document.createElement('option');
                opt.setAttribute('class', 'formOption');
                opt.innerText = path.parse(fileName).name;
                opt.value = fileName;
                form.appendChild(opt);
            }
        } catch (err) {
                console.error(err);
        }
    }
    
const MechSubtypeFunc = async function addSubtypes() {
    let mechChassis = document.getElementById("mech");
    let mechChoice = mechChassis.options[mechChassis.selectedIndex].text;
    const subtypeSelect = document.getElementById("subtype");
    while (subtypeSelect.firstChild){
        subtypeSelect.removeChild(subtypeSelect.lastChild);
    }
    let defaultOpt = document.createElement("option")
    defaultOpt.value = "default";
    defaultOpt.innerText = " ——— VARIANT NAME ———"
    defaultOpt.disabled = true;
    defaultOpt.selected = true;
    subtypeSelect.appendChild(defaultOpt);
    const directoryPath = path.join(__dirname, '..\\assets\\mdf\\', mechChoice +  '\\')
    const subtype_array = await fs.readdir(directoryPath, {withFileTypes: false});
    for (subtype of subtype_array){
        fileData = await fs.readFile(directoryPath+subtype, 'utf-8');
        const doc = Parser.parseFromString(fileData, 'text/xml').getRootNode();
        const mechVariant = doc.evaluate(
            'string(MechDefinition/Mech/@Variant)',
            doc,
            null,
            XPathResult.ANY_TYPE,
            null
        )
        let subtypeSelect = document.getElementById("subtype");
        const opt = document.createElement('option');
        opt.value = subtype;
        opt.innerText = mechVariant.stringValue
        subtypeSelect.appendChild(opt);
    }

} 

const autoFillPartsFunc = async function autoFillParts(){
    let subtypeChoice = document.getElementById("subtype");
    let fileName = subtypeChoice.options[subtypeChoice.selectedIndex].value;
    let chassisName = jquery("#mech option:selected")[0].text;
    let directoryPath = path.join(__dirname, '..\\assets\\mdf\\', chassisName, fileName);
    mechFileData = await fs.readFile(directoryPath, 'utf-8');
    currentMechDef = jquery(jquery.parseXML(mechFileData));
    //let components = currentMechDef.find("Component[Name='centre_torso'] > Piece > Attachment");
    for (select of document.getElementsByClassName("componentSelect")){
        for (removee of select.getElementsByClassName("formOption")){
            console.log('removing '+removee);
            removee.remove;
        }
        console.log("Component[Name='" + select.name + "']");
        let component = currentMechDef.find("Component[Name*='" + select.name + "'] > Piece > Attachment");      
        component.each(function(index) {
            let newOpt = document.createElement("option");
            let attachmentName = jquery(component.get(index), "Attachment").attr("AName");
            newOpt.value = attachmentName;
            newOpt.innerHTML = attachmentName;
            newOpt.selected = 'true';
            newOpt.setAttribute('class', 'formOption');
            console.log(newOpt);
            select.appendChild(newOpt);
            select.setAttribute('size', component.length);
        })
    };
}

const scriptSetupFunc = function scriptSetup(){
    MechChassisFunc();
    jquery = require("jquery");
    document.getElementById("mech").addEventListener('change', MechSubtypeFunc);
    document.getElementById("subtype").addEventListener('change', autoFillPartsFunc);
}

window.addEventListener('DOMContentLoaded', scriptSetupFunc);
