/*classes*/
class modalAlertManager {
    constructor(svgObject) {
        this.title = "Alert";
        this.description = "Processing, please wait..."
        this.canEscape = false;
        this.svgObject = svgObject;
    }
    static ns = "http://www.w3.org/2000/svg";
    setTitle(string) {
        this.svgObject.getElementById(modalTitle).innerHTML = string;
        this.title = string;
    }
    title() {
        return this.title;
    }
    setDescription(string) {
        this.svgObject.getElementById(modalDescription).innerHTML = string;
        this.description = string;
    }
    description() {
        return this.description;
    }
    setCanEscape(boolean) {
        this.canEscape = boolean;
        this.setVisibility(this.svgObject.getElementById("modalClose"), boolean);
    }
    canEscape() {
        return this.canEscape;
    }
    setButton(buttonNumber, boolean, string) {
      let buttonObj = this.svgObject.getElementById("button"+buttonNumber);
      let buttonTextObj = this.svgObject.getElementById("button"+buttonNumber+"Text");
      buttonTextObj.innerHTML = string;
      this.setVisibility(buttonObj, boolean);
      this.setVisibility(buttonTextObj, boolean);
    }
    setVisibility(element, boolean){
      console.log("Setting visibility of "+element.getAttributeNS(null, "id")+" to "+boolean);
      if(boolean){
        element.setAttributeNS(null, "visibility", "visible");
      }
      if(!boolean){
        element.setAttributeNS(null, "visibility", "hidden")
      }
    }
    displayModal () {
      document.getElementById("modalAlert").style.display = "block";
    }
    hideModal () {
      if(this.canEscape()){
      document.getElementById("modalAlert").style.display = "none";
      }
    }
    forceHideModal () {
      document.getElementById("modalAlert").style.display = "none";
    }
    generate(title, description, canEscape, button1, button2, button3, button1Text, button2Text, button3Text) {
        this.setTitle(title);
        this.setDescription(description);
        this.setCanEscape(canEscape);
        this.setButton(1, button1, button1Text);
        this.setButton(2, button2, button2Text);
        this.setButton(3, button3, button3Text);
    }
}
/*onLoad*/
window.addEventListener("load", function () { // Get the modal
    let modalLayer = document.getElementById("modalAlert");
    let btn = document.getElementById("myBtn");
    let closeButton = document.getElementsByClassName("modalClose")[0];
    let modalSVG = document.getElementById("modalSVG");
    let alertManager = new modalAlertManager(modalSVG);
    // Test Button
    btn.onclick = function () {
        alertManager.displayModal();
    }
    // When the user clicks on <span> (x), close the modal
    closeButton.onclick = function () {
        alertManager.hideModal();
    }
    // When the user clicks anywhere outside of the modal, close it
    window.onclick = function (event) {
      console.log(event.target);
        if (event.target == modalLayer) {
          alertManager.hideModal();
        }
    }
    // get svg xml document
    let svgObject = document.getElementById('mechOutline').contentDocument;
    // get svg tag as object
    let mechSVG = svgObject.getElementById('mechSVG');
    // debug output
    console.log(mechSVG);
    // add event listener to respond to click
    mechSVG.addEventListener('pointerdown', function (event) {
        console.log(event.target);
        if (event.target.closest('stroke')) 
            return;
        
        // call toggleComponentGroup
        deselectComponent(mechSVG);
        let selectionGroup = event.target.getAttributeNS(null, 'class')
        if (selectionGroup != null) {
            console.log(selectionGroup);
            let pathGroup = mechSVG.getElementById(selectionGroup);
            console.log(pathGroup);
            selectComponent(pathGroup);
        }
    }, false);
});
/*functions*/
function selectComponent(pathGroup) {
    let pathArray = pathGroup.getElementsByTagName("path");
    console.log('selecting ' + pathGroup.getAttributeNS(null, 'id'));
    pathGroup.setAttributeNS(null, 'class', 'selected')
    pathArray.item(0).setAttributeNS(null, 'stroke', '#ffffff');
}
function deselectComponent(mechSVG) {
    let selected = mechSVG.querySelectorAll(".selected");
    if (selected.length > 0) {
        console.log('deselecting ' + selected.item(0).getAttributeNS(null, 'id'));
        let pathArray = selected.item(0).getElementsByTagName("path");
        selected.item(0).setAttributeNS(null, 'class', 'enabled')
        pathArray.item(0).setAttributeNS(null, 'stroke', '#816c3f');
    }
}
