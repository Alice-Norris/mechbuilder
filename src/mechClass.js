const path = require("path");
const fs = require("fs/promises");
const { off } = require("process");
const Parser = new DOMParser();

//contains hardpoints, not present in IS mechs, held in components
class omnipod {
    location; //location on mech body
    quirks; //quirks data, future use???
    hardpoints; //holds hardpoint objects
    ecm; //can equip ecm?

    constructor(location = null, quirks = [], hardpointInfo = [], ecm = false){    
        this.location = location;
        this.quirks = quirks;
        this.hardpoints = hardpoints;
        this.ecm = ecm;
    }
}
//contained in omnipod if clan mech, contained in component if not
class hardpoint {
    location;
    weaponSlots;
    id;

    constructor(location = null, weaponSlots = [], id = 0){
        this.location = location;
        this.weaponSlots = weaponSlots;
        this.id = id;
    }
}

class component{
    location; //location on mech
    slots; 
    hp; 
    ecm; //can this component equip ECM? false if clan mech
    attachments; //attachments for structure
    hardpoints = [];

    constructor(location = "none", slots = 0, hp = 0, ecm = false, attachments = [], hardpoints = []){
        this.location = location;
        this.slots = slots;
        this.hp = hp;
        this.ecm = ecm;
        this.attachments = attachments;
        this.hardpoints = hardpoints;
    }
}

class mech {
    chassis;
    subtype;
    omniMech;
    mdfData;
    cdfData;
    omnipodData;
    hardpointData;
    hardpoints;
    structure;

    constructor(chassis, subtype, mdfFileName = null){
        this.chassis = chassis;
        this.omniMech = false;
        this.subtype = subtype;
        this.hardpoints = [];
        this.structure = [];
        this.mdfFileName = mdfFileName;
    }
    
    //function to get all mech data by calling helper functions
    async buildMech(){
        await this.readFileData()
        await this.getStructureData(); //wait for structure to get filled
        if (this.omniMech === false){ //if this is an omni mech,
            console.log("It's not even an OmniMech...");
        }
    }

    async readFileData() {
        try{
            let mdfFile = await fs.readFile(path.join(__dirname, "..\\assets\\mdf\\", this.chassis, "\\", this.mdfFileName), 'utf-8');
            this.mdfData = Parser.parseFromString(mdfFile, 'text/xml');
            let omnislots = this.mdfData.evaluate("count(//*[@OmniSlot])", this.mdfData)
            if (omnislots.numberValue > 0){
                this.omniMech = true;
            }
            console.log(this.subtype, "MDF file loaded!")

            let cdfFile = await fs.readFile(path.join(__dirname, "..\\assets\\cdf\\stock\\" + this.chassis + ".cdf"), 'utf-8');
            this.cdfData = Parser.parseFromString(cdfFile, 'text/xml');
            console.log(this.subtype, " CDF file loaded!");
            
            let hardpointXML = await fs.readFile(path.join(__dirname, "..\\assets\\MechXML\\" + this.chassis + "\\" + this.chassis + "-hardpoints.xml"), 'utf-8');
            this.hardpointData = Parser.parseFromString(hardpointXML, 'text/xml');
            console.log("Hardpoint Data Loaded!");

            if (this.omniMech === true){
                let omnipodXML = await fs.readFile(path.join(__dirname, "..\\assets\\MechXML\\" + this.chassis + "\\" + this.chassis + "-omnipods.xml"), 'utf-8');
                this.omnipodData = Parser.parseFromString(omnipodXML, 'text/xml');
                console.log("Omnipod Data Loaded!");
            }
        } catch(err) {
            console.error(err);
        }
    }

    async getStructureData(){
        //get structure elements from mdfdata
        const structureNodes = this.mdfData.evaluate("/MechDefinition/ComponentList/Component", this.mdfData);
        //temp variable to hold individual nodes while iterating
        let structureNode;
        //iterate over all Component nodes in structureNodes
        while((structureNode = structureNodes.iterateNext()) != null){
            //location, number of slots, HP, whether an ECM is equippable, 
            let location = structureNode.getAttributeNS(null, "Name"); //location of component (e.g., head, center torso, etc.)
            let slots = structureNode.getAttributeNS(null, "Slots"); 
            let hp = structureNode.getAttributeNS(null, "HP");
            let ecm; 
            let attachments = []
            let attachmentNodes = structureNode.getElementsByTagNameNS(null, "Attachment");
            let hardpointIDs = [];
            for (let attachmentNode of attachmentNodes){
                let attachment = attachmentNode.getAttributeNS(null, "AName");
                attachments.push(attachment);
            }
            if ( this.omniMech == false){
                if (structureNode.getAttributeNS(null, "CanEquipECM") != null){
                    this.ecm = true;
                }
                //get all Hardpoint elements, if any
                let hardpointNodes = structureNode.getElementsByTagNameNS(null, "Hardpoint");
                //if there are hardpoint nodes...
                if (hardpointNodes.length > 0){
                    //add all hardpoint IDs to the list of hardpoint Ids
                    for (let hardpointNode of hardpointNodes){
                        hardpointIDs.push(hardpointNode.getAttributeNS(null, "ID"));
                    }
                    //pass location and hardpoint IDs to create hardpoints
                    this.createISHardpoints(location, hardpointIDs); 
                }
            } else {
                hardpointIDs = this.createClanHardpoints(location);
            }
            let newComponent = new component(location, slots, hp, ecm, attachments, hardpointIDs);
            this.structure.push(newComponent)
        }
    }

    //creates hardpoints for non-clan mechs
    createISHardpoints(location, hardpointIDs){
        let weaponSlots = []
        for (let hardpointID of hardpointIDs){
            //get all weaponslots for the hardpoint with this id
            let weaponSlotNodes = this.hardpointData.evaluate("/Hardpoints/Hardpoint[@id='" + hardpointID + "']/WeaponSlot",
                                                        this.hardpointData,
                                                        null,
                                                        XPathResult.ORDERED_NODE_ITERATOR_TYPE);
            //holder for individual weaponslot nodes
            let weaponSlotNode;
            //get another weaponslot element while there is one
            while((weaponSlotNode = weaponSlotNodes.iterateNext()) != null){
                //get all attachments inside of the weaponslot
                let weaponList = weaponSlotNode.getElementsByTagNameNS(null, "Attachment");
                //array of weapons for this hardpoint
                let weaponSlot = []; 
                //for each weapon in the list of weapons from XML...
                for (let weapon of weaponList){
                    //create a JSON object of that weapon
                    let attachment = {"Weapon Name" : weapon.getAttributeNS(null, "search"), "Attachment" : weapon.getAttributeNS(null, "AName")}
                    //add it to the weaponSlot
                    weaponSlot.push(attachment);      
                }
                //add weaponSlot to the list of weaponSlots
                weaponSlots.push(weaponSlot);       
            }
            let newHardpoint = new hardpoint(location, weaponSlots, hardpointID);
            this.hardpoints.push(newHardpoint);
        }
    }

    createClanHardpoints(location){
        
        let hardpointNodes = this.omnipodData.evaluate("/OmniPods/Set[@name ='" + this.subtype.toLowerCase() + "']/component[@name = '" + location + "']/Hardpoint",
                                                       this.omnipodData,
                                                       null,
                                                       XPathResult.ORDERED_NODE_ITERATOR_TYPE);
        let hardpointNode;
        let hardpointIDs = [];
            while((hardpointNode = hardpointNodes.iterateNext()) != null){
                hardpointIDs.push(hardpointNode.getAttributeNS(null, "ID"));
            };
        if (hardpointIDs.length !=0){
            let weaponSlots = [];
            for (let hardpointID of hardpointIDs){
                let weaponSlotNodes = this.hardpointData.evaluate("/Hardpoints/Hardpoint[@id='" + hardpointID + "']/WeaponSlot",
                                            this.hardpointData,
                                            null,
                                            XPathResult.ORDERED_NODE_ITERATOR_TYPE);
                let weaponSlotNode;
                let weaponSlot = [];
                while((weaponSlotNode = weaponSlotNodes.iterateNext()) != null){
                    let weaponsList = weaponSlotNode.getElementsByTagNameNS(null, "Attachment");
                    for (let weapon of weaponsList){
                            weaponSlot.push({"Weapon Name" : weapon.getAttributeNS(null, "search"), "Attachment": weapon.getAttributeNS(null, "AName")})
                    }
                weaponSlots.push(weaponSlot);
                }
                let newHardpoint = new hardpoint(location, weaponSlots, hardpointID);
                this.hardpoints.push(newHardpoint); 
            }
        return hardpointIDs;
        }
    }
}


module.exports = {mech};