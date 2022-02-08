const path = require("path");
const fs = require("fs/promises");
const { off } = require("process");
const Parser = new DOMParser();


class omnipod {
    component;
    quirks;
    hardpoints;
    ecm;

    constructor(component = null, quirks = [], hardpoints = [], ecm = false){    
        this.component;
        this.quirks;
        this.hardpoints;
        this.ecm;
    }
}

class hardpoint {
    location;
    weaponSlots;
    id;

    constructor(location = null, weaponSlots = 0, id = 0){
        this.location
        this.weaponSlots
        this.id
    }
}

class component{
    location;
    slots;
    hp;
    ecm;
    attachments;

    constructor(location = "none", slots = 0, hp = 0, ecm = false, attachments = []){
        this.location;
        this.slots;
        this.hp;
        this.ecm;
        this.attachments;
    }
}

class mech {
    chassis;
    subtype;
    omniMech;
    mdfData;
    omnipods;
    weapons;
    structure;

    constructor(chassis, subtype, omniMech = false, mdfData = null){
        this.chassis = chassis;
        this.omniMech = omniMech;
        this.subtype = subtype;
        this.mdfData = mdfData;
        this.omnipods = [];
        this.weapons = [];
        this.structure = [];
    }
    
    async buildMech(){
        await this.readMdfFile();
        await this.getStructureData();
        if (!this.mdfData.getElementsByTagNameNS(null, "MechDefinition").item(0).getAttributeNS(null, "Version")){
            console.log("It's not even an OmniMech...");
        } else {
            this.omniMech = true;
            await this.getOmnipodData();
        }
    }

    async readMdfFile() {
        let mdfFile = await fs.readFile(path.join(__dirname, "..\\assets\\mdf\\", this.chassis, "\\" ,this.subtype + ".mdf"), 'utf-8');
        let hardpointIDs = [];
        this.mdfData =  Parser.parseFromString(mdfFile, 'text/xml');           
    }

    async getStructureData(){
        var tempStructure = [];
        var structureNodes = this.mdfData.getElementsByTagNameNS(null, "Component");
        
        for (let structureNode of structureNodes){
            console.log(structureNode);
            let location = structureNode.getAttributeNS(null, "Name");
            let slots = structureNode.getAttributeNS(null, "Slots");
            let hp = structureNode.getAttributeNS(null, "HP");
            let ecm = false;
            if (structureNode.getAttributeNS(null, "CanEquipECM") === null){
                ecm = true;
            };
            for (let attachment of structureNode.getElementsByTagNameNS(null, "Attachment")){
                newComponent.attachments.push(attachment.getAttributeNS(null, "AName"));
            };
            newComponent.push(tempStructure);
            console.log("newComponent: ", newComponent);
            this.structure = tempStructure;
        }
    }

    async getOmnipodData(){
        
        var omnipodFile = await fs.readFile(path.join(__dirname, "..\\assets\\mechXML\\", this.chassis, "\\", this.chassis + "-omnipods.xml"), 'utf-8');
        let omnipodData = Parser.parseFromString(omnipodFile, 'text/xml');
        let subtypeOmnipods = omnipodData.getElementsByName(this.subtype.toLowerCase());   
        
        for (let child of subtypeOmnipods.item(0).getElementsByTagNameNS(null, "component")){
            let currentOmnipod = new omnipod();
            currentOmnipod.location = child.getAttributeNS(null, "name");
            for (let quirk of child.getElementsByTagNameNS(null, "Quirk")){
                let quirkName = quirk.getAttributeNS(null, "name");
                let quirkValue = quirk.getAttributeNS(null, "value");
                let quirkObject = {"Quirk Name" : quirkName, "Quirk Value" : quirkValue };
                currentOmnipod.quirks.push(quirkObject);
                
            };
            for (let hardpoint of child.getElementsByTagNameNS(null, "Hardpoint")){
                let hardpointID = hardpoint.getAttributeNS(null, "ID");
                let hardpointType = hardpoint.getAttributeNS(null, "Type");
                let hardpointObject = {"Hardpoint ID" : hardpointID, "Hardpoint Type" : hardpointType};
                currentOmnipod.hardpoints.push(hardpointObject);
                this.getHardpointData(hardpointID);

            };
        }
    }

    async getHardpointData(){
        let hardpointFile = await fs.readFile(path.join(__dirname, "..\\assets\\mechXML\\", this.chassis, "\\", this.chassis + "-hardpoints.xml"), 'utf-8');
        let hardpointData = Parser.parseFromString(hardpointFile, 'text/xml');
        let hardpointInfo = hardpointData.getElementById(id);
        let newHardpoint = new hardpoint();
        if (this.omniMech){
            let components = this.omnipods;
        } else {
            let components = this.components;
        }
        for (component in components) {
            console.log(component.location)
        }
        // let weaponSlotInfo = hardpointInfo.getElementsByTagNameNS(null, "WeaponSlot");
        // for (let weaponSlot of weaponSlotInfo){
        //     var weaponSlotOptions = [];
        //     for (let attachment of weaponSlot.children) {
        //         var weaponName = attachment.getAttributeNS(null, "search");
        //         var weaponAttachment = attachment.getAttributeNS(null, "AName");
        //         weaponSlotOptions.push({"name" : weaponName, "attachment" : weaponAttachment});
        //     };
        //     newHardpoint.weaponSlots.push(weaponSlotOptions);
        //     this.hardpoints.push(newHardpoint);

        // };
    }
}

module.exports = {mech};