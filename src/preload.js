const { systemPreferences } = require("electron");
const path = require("path");
const fs = require("fs/promises");

const MechChassisFunc = async function addMechChassis() {
        try{
            const directoryPath = path.join(__dirname, '..\\assets\\cdf\\stock\\');
            const chassis_array = await fs.readdir(directoryPath, { withFileTypes: false});
            for (fileName of chassis_array){
                let form = document.getElementById("mech");
                const opt = document.createElement('option');
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
    console.log(mechChoice);
    const subtypeSelect = document.getElementById("subtype")
    while (subtypeSelect.firstChild) {
        subtypeSelect.removeChild(subtypeSelect.firstChild);
    }
    const directoryPath = path.join(__dirname, '..\\assets\\mdf\\', mechChoice +  '\\')
    const subtype_array = await fs.readdir(directoryPath, {withFileTypes: false});
    for (subtype of subtype_array){
        fileData = await fs.readFile(directoryPath+subtype, 'utf-8');
        const Parser = new DOMParser();
        const doc = Parser.parseFromString(fileData, 'text/xml').getRootNode();
        const mechVariant = doc.evaluate(
            'string(MechDefinition/Mech/@Variant)',
            doc,
            null,
            XPathResult.ANY_TYPE,
            null
        )
        console.log(mechVariant.stringValue);
        let form = document.getElementById("subtype");
        const opt = document.createElement('option');
        opt.value = subtype;
        opt.innerText = mechVariant.stringValue
        form.appendChild(opt);
    }

} 

const autoFillPartsFunc = async function autoFillParts(){
    const subtypeChoice = document.getElementById("subtype");
    const subtype = subtypeChoice.options[mechChoice.selectedIndex]
}
const scriptSetupFunc = function scriptSetup(){
    MechChassisFunc();
    document.getElementById("mech").addEventListener('change', MechSubtypeFunc);
}

window.addEventListener('DOMContentLoaded', scriptSetupFunc);
//window.addEventListener('change', MechSubtypeFunc)
