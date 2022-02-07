const fs = require("fs/promises");
const Parser = new DOMParser();

class mech {
    constructor(){
        this.chassis;
        this.subtype;
        this.mdfData;
        this.hardpoints;
        this.omnipods;
        this.weapons;
    }
    
    static readMdfFile() {
        this.mdfFile = await fs.read(path.join(__dirname, "..\\assets\\mdf\\", this.chassis, ".mdf"));
        this.mdfData = Parser.parseFromString(mdfFile, 'application/xml')
        console.log(mdfData);
    }
    static getOmnipodData(){

    }
}