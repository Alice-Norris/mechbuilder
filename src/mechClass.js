const path = require("path");
const fs = require("fs/promises");
const { off } = require("process");
const Parser = new DOMParser();


class omnipod {
    location;
    quirks;
    hardpointInfo;
    ecm;

    constructor(location = null, quirks = [], hardpointInfo = [], ecm = false){    
        this.location = location;
        this.quirks = quirks;
        this.hardpointInfo = hardpointInfo;
        this.ecm = ecm;
    }
}

class hardpoint {
    location;
    weaponSlots;
    id;

    constructor(location = null, weaponSlots = [], id = 0){
        this.location = location;
        this.weaponSlots = weaponSlots
        this.id = 0
    }
}

class component{
    location;
    slots;
    hp;
    ecm;
    attachments;
    hardpointInfo;

    constructor(location = "none", slots = 0, hp = 0, ecm = false, attachments = [], hardpointInfo = []){
        this.location = location;
        this.slots = slots;
        this.hp = hp;
        this.ecm = ecm;
        this.attachments = attachments;
        this.hardpointInfo = hardpointInfo;
    }
}

class mech {
    chassis;
    subtype;
    omniMech;
    mdfData;
    omnipods;
    hardpoints;
    structure;

    constructor(chassis, subtype, omniMech = false, mdfData = null){
        this.chassis = chassis;
        this.omniMech = omniMech;
        this.subtype = subtype;
        this.mdfData = mdfData;
        this.omnipods = [];
        this.hardpoints = [];
        this.structure = [];
    }
    
    async buildMech(){
        await this.readMdfFile();
        await this.getStructureData();
        if (this.omniMech === false){
            console.log("It's not even an OmniMech...");
        } else {
            this.omniMech = true;
            await this.getOmnipodData();
        }
        await this.getHardpointData();
    }

    async readMdfFile() {
        let mdfFile = await fs.readFile(path.join(__dirname, "..\\assets\\mdf\\", this.chassis, "\\" ,this.subtype + ".mdf"), 'utf-8');
        let hardpointIDs = [];
        this.mdfData =  Parser.parseFromString(mdfFile, 'text/xml');           
    }

    async getStructureData(){
        let clanMechCheck = this.mdfData.evaluate("count(/MechDefinition[@Version])", this.mdfData)
        if (clanMechCheck.numberValue === 1){
            this.omniMech = true;
        };
        var tempStructure = [];
        var structureNodes = this.mdfData.evaluate("/MechDefinition/ComponentList/Component", this.mdfData);
        var structureNode;
        while((structureNode = structureNodes.iterateNext()) != null){
            let location = structureNode.getAttributeNS(null, "Name");
            let slots = structureNode.getAttributeNS(null, "Slots");
            let hp = structureNode.getAttributeNS(null, "HP");
            let ecm = false;
            let hardpointInfoObjects = [];
            if (structureNode.getAttributeNS(null, "CanEquipECM") === null){
                ecm = true;
            };
            let attachments = []
            for (let attachment of structureNode.getElementsByTagNameNS(null, "Attachment")){
                attachments.push(attachment.getAttributeNS(null, "AName"));
            };
            if (this.omniMech === false){
                let hardpointInfo;
                const hardpointInfoNodes = this.mdfData.evaluate("/MechDefinition/ComponentList/Component[@Name='" + location + "']/Hardpoint",
                                                                this.mdfData,
                                                                null,
                                                                XPathResult.UNORDERED_NODE_ITERATOR_TYPE,
                                                                null);
                let hardpointInfoNode;
                while(hardpointInfoNode = hardpointInfoNodes.iterateNext()){
                    let hardpointID = hardpointInfoNode.getAttributeNS(null, "ID");
                    let hardpointType = hardpointInfoNode.getAttributeNS(null, "Type");
                    let hardpointSlots = hardpointInfoNode.getAttributeNS(null, "Slots");
                    let hardpointLocation = location;
                    let hardpointInfoObject = {"ID" : hardpointID, "Type" : hardpointType, "Slots" : hardpointSlots, "Location" : hardpointLocation};
                    let arrayLength = hardpointInfoObjects.push(hardpointInfoObject);
                    console.log("hardpointInfoObjects length = "+arrayLength)
                };
                var newComponent = new component(location, slots, hp, ecm, attachments, hardpointInfoObjects);
            } else {
                var newComponent = new component(location, slots, hp, ecm, attachments);
            };
            console.log(newComponent);
            tempStructure.push(newComponent);
            this.structure = tempStructure;
            }
        }   

    async getOmnipodData(){
        const tempOmnipods = [];
        const omnipodFile = await fs.readFile(path.join(__dirname, "..\\assets\\mechXML\\", this.chassis, "\\", this.chassis + "-omnipods.xml"), 'utf-8');
        const omnipodData = Parser.parseFromString(omnipodFile, 'text/xml');
        const omnipodNodes = omnipodData.evaluate("/OmniPods/Set[@name='" + this.subtype.toLowerCase() + "']/component", omnipodData);
        let omnipodNode;
        while((omnipodNode = omnipodNodes.iterateNext()) != null){
            let quirks = [];
            let hardpointInfo = [];
            let location = omnipodNode.getAttributeNS(null, "name");
            let ecm = false;
            const quirkNodes = omnipodData.evaluate("/OmniPods/Set[@name='" + this.subtype.toLowerCase() + "']/component/Quirk", omnipodData);
            let quirkNode;
            while((quirkNode = quirkNodes.iterateNext()) != null){
                let quirk;
                let quirkName = quirkNode.getAttributeNS(null, "name");
                let quirkValue = quirkNode.getAttributeNS(null, "value");
                let quirkObject = {"Quirk Name" : quirkName, "Quirk Value" : quirkValue };
                quirks.push(quirkObject);
            };
            const hardpointInfoNodes = omnipodData.evaluate("/OmniPods/Set[@name='" + this.subtype.toLowerCase() + "']/component/Hardpoint", omnipodData);
            let hardpointInfoNode;
            while((hardpointInfoNode = hardpointInfoNodes.iterateNext()) != null){    
                let hardpointInfoID = hardpointInfoNode.getAttributeNS(null, "ID");
                let hardpointInfoType = hardpointInfoNode.getAttributeNS(null, "Type");
                let hardpointInfoObject = {"Hardpoint ID" : hardpointInfoID, "Hardpoint Type" : hardpointInfoType};
                hardpointInfo.push(hardpointInfoObject);
            }
            const newOmnipod = new omnipod(location, quirks, hardpointInfo, ecm);
            this.omnipods.push(newOmnipod);
        }
    }

    async getHardpointData(){
        const tempHardpoints = [];
        const hardpointFile = await fs.readFile(path.join(__dirname, "..\\assets\\mechXML\\", this.chassis, "\\", this.chassis + "-hardpoints.xml"), 'utf-8');
        const hardpointData = Parser.parseFromString(hardpointFile, 'text/xml');
        const hardpointNodes = hardpointData.evaluate("/Hardpoints/Hardpoint", hardpointData, null, XPathResult.ORDERED_NODE_ITERATE_TYPE, null);
        let hardpointID;
        let hardpointNode;
        let hardpointLocation;
        let weaponSlots = [];
        while(hardpointNode = hardpointNodes.iterateNext()){
            hardpointID = hardpointNode.getAttributeNS(null, "id");
            console.log(hardpointNode);
            console.log(hardpointID);
            this.matchHardpointToLocation(hardpointID);
            const weaponSlotNodes = hardpointData.evaluate("/Hardpoints/Hardpoint[@id='" + hardpointID + "']/WeaponSlot/Attachment", hardpointData, null, XPathResult.ORDERED_NODE_ITERATOR_TYPE, null);
            let weaponSlotNode;
            while (weaponSlotNode=weaponSlotNodes.iterateNext()){
                let weaponName = weaponSlotNode.getAttributeNS(null, "search");
                let attachmentName =weaponSlotNode.getAttributeNS(null, "AName");
                let weaponSlotObject = {"Weapon Name" : weaponName, "Asset Name" : attachmentName};
                weaponSlots.push(weaponSlotObject);
            };
            let newHardpoint = new hardpoint(hardpointLocation, weaponSlots, hardpointID);
            console.log(newHardpoint);
            tempHardpoints.push(newHardpoint);
        };
        // while(hardpointNode = hardpointNodes.iterateNext()){
        //     hardpointID = hardpointNode.getAttributeNS(null, "id");
        //     let weaponSlots = [];
        //     const weaponSlotNodes = hardpointData.evaluate("Hardpoints/Hardpoint[@id='" + hardpointID + "']/WeaponSlot/Attachment", hardpointData);
        //     let weaponSlotNode;
        //     while( (weaponSlotNode = hardpointNodes.iterateNext()) != null){
        //         let weaponName = weaponSlotNode.getAttributeNS(null, "search");
        //         let attachmentName = weaponSlotNode.getAttributeNS(null, "AName");
        //         let weaponSlotObject = {"Weapon Name" : weaponName, "Asset Name" : attachmentName};
        //         weaponSlots.push(weaponSlotObject);
        //     };  
        //     let newHardpoint = new hardpoint(hardpointID, weaponSlots);
        //     tempHardpoints.push(newHardpoin  t);
        // };
        this.hardpoints = tempHardpoints;  
    }

    matchHardpointToLocation = function(hardpointID){
        let searchArray = [];
        console.log(this.structure);
        console.log(this.structure.hardpointInfo);
        if(this.omniMech === false){
            for(let componentNode of this.structure){
                searchArray.push(componentNode.hardpointInfo);
                console.log(componentNode.hardpointInfo);
                //searchArray = this.structure.hardpointInfo;
            }
        } else {
            for(let componentNode of this.omnipods){
                searchArray.push(componentNode.hardpointInfo);
                console.log(hardpointID);
                //searchArray = this.omnipods.hardpointInfo;
            }
        }
        console.log(searchArray);
        searchArray.filter(function(item) {
            console.log(item);
        })
        
    }
}

module.exports = {mech};