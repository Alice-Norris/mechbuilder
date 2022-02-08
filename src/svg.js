/*classes*/
class modalAlert {
    constructor() {
        this.title = "Alert";
        this.description = "Processing, please wait..."
        this.canEscape = false;
        this.svgObject = null;
    }
    static ns = "http://www.w3.org/2000/svg";
    setTitle(string) {
        this.title = string;
    }
    title() {
        return this.title;
    }
    setDescription(string) {
        this.description = string;
    }
    description() {
        return this.description;
    }
    setCanEscape(boolean) {
        this.canEscape = boolean;
    }
    canEscape() {
        return this.canEscape;
    }
    draw() {
        this.svgObject = null;
    }
}
/*onLoad*/
window.addEventListener("load", function () { // Get the modal
    let modalLayer = document.getElementById("modalAlert");
    let btn = document.getElementById("myBtn");
    let closeButton = document.getElementsByClassName("modalClose")[0];
    let modalSVG = document.getElementById("modalSVG");
    // Test Button
    btn.onclick = function () {
        modalLayer.style.display = "block";
    }
    // When the user clicks on <span> (x), close the modal
    closeButton.onclick = function () {
        modalLayer.style.display = "none";
    }
    // When the user clicks anywhere outside of the modal, close it
    window.onclick = function (event) {
      console.log(event.target);
        if (event.target == modalLayer) {
            modalLayer.style.display = "none";
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
