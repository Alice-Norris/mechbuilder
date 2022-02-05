const { systemPreferences } = require("electron");
const path = require("path");
const fs = require("fs/promises");

const MechChassisFunc = async function addMechChassis() {
    console.log(path.join(__dirname, '..\\assets\\cdf\\stock\\'));
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
    const mechChoice = document.getElementById("mech");
    const mechChassis = mechChoice.options[mechChoice.selectedIndex].innerText;
    const directoryPath = path.join(__dirname, '..\\assets\\mdf\\' + mechChassis +  '\\')
    const subtype_array = await fs.readdir(directoryPath, {withFileTypes: false});
    for (subtype of subtype_array){
        fileData = await fs.readFile(directoryPath+subtype, 'utf-8');
        const Parser = new DOMParser();
        const doc = Parser.parseFromString(fileData, 'text/xml');
        const mechElement = doc.getElementsByTagName("Mech").item(0);
        console.log(mechElement.getAttribute('Variant'));
        let form = document.getElementById("subtype");
        const opt = document.createElement('option');
        opt.innerText = mechElement.getAttribute("Variant");
        opt.value = fileName;
        form.appendChild(opt);
    }

} 

const autoFillPartsFunc = async function autoFillParts(){
    const subtypeChoice = document.getElementById("subtype");
    const subtype = subtypeChoice.options[mechChoice.selectedIndex]
}
window.addEventListener('DOMContentLoaded', MechChassisFunc);
window.addEventListener('change', MechSubtypeFunc)
