/*classes*/
class modalAlertManager {
    constructor(svgObject) {
        this.title = "Alert";
        this.description = "Processing, please wait..."
        this.canEscape = false;
        this.svgObject = svgObject;
        this.ns = "http://www.w3.org/2000/svg";
        this.loadingAnim = null;
    }
    setLoadingAnim(animSVG) {
      this.loadingAnim = animSVG.cloneNode(true);
      let discardLayer = animSVG.getElementById("transformLayer");
      discardLayer.setAttributeNS(null, "id", "discardLayer");
      discardLayer.setAttributeNS(null, "transform", "");
      this.loadingAnim.setAttributeNS(null, "id", "mechGoesSpinny");
      let animation = this.loadingAnim.getElementById("loadingAnim");
      animation.setAttributeNS(null, "id", "rightRoundBaby");
      this.loadingAnim.setAttributeNS(null, "height", "10");
      this.loadingAnim.setAttributeNS(null, "width", "10");
      this.loadingAnim.setAttributeNS(null, "x", "10");
      this.loadingAnim.setAttributeNS(null, "y", "10");
      let group = this.loadingAnim.getElementById("animationGroup")
      group.setAttributeNS(null, "id", "animationGronp");
      let sidebar = this.svgObject.getElementById("modalSidebar");
      this.setVisibility(this.loadingAnim, !this.getCanEscape());
      console.log(this.loadingAnim);
      sidebar.prepend(this.loadingAnim);
      animation = this.loadingAnim.getElementById("rightRoundBaby");
      console.log(animation);
      animation.beginElement();
    }
    getLoadingAnim() {
      return this.loadingAnim;
    }
    setSvgObject(svgObj) {
      this.svgObject = svgObj;
    }
    getSvgObject() {
      return this.svgObject;
    }
    setTitle(string) {
        this.svgObject.getElementById("modalTitle").innerHTML = string;
        this.title = string;
    }
    getTitle() {
        return this.title;
    }
    setDescription(string) {
        this.svgObject.getElementById("modalDescription").innerHTML = string;
        this.description = string;
    }
    getDescription() {
        return this.description;
    }
    setCanEscape(boolean) {
        this.canEscape = boolean;
        this.setVisibility(this.svgObject.getElementById("modalClose"), boolean);
        if(this.loadingAnim){this.setVisibility(this.loadingAnim, !boolean);}
    }
    getCanEscape() {
        return this.canEscape;
    }
    setButton(buttonNumber, boolean, string) {
      let buttonObj = this.svgObject.getElementById("button"+buttonNumber);
      let buttonTextObj = this.svgObject.getElementById("button"+buttonNumber+"Text");
      buttonTextObj.innerHTML = string;
      this.setVisibility(buttonObj, boolean);
      this.setVisibility(buttonTextObj, boolean);
    }
    getButton(buttonNumber){
      return this.svgObject.getElementById(`button${buttonNumber}`);
    }
    setVisibility(element, boolean){
      console.log(element);
      console.log("Setting visibility to "+boolean);
      if(boolean){
        element.setAttributeNS(null, "visibility", "visible");
      }
      else{
        element.setAttributeNS(null, "visibility", "hidden")
      }
    }
    displayModal () {
      document.getElementById("modalAlert").style.display = "block";
    }
    hideModal () {
      if(this.canEscape){
        document.getElementById("modalAlert").style.display = "none";
      } else{
        console.log("hiding modal alert is disabled!");
        let animation1 = this.svgObject.getElementById("animFrame1");
        animation1.beginElement();}
      }
    forceHideModal() {
      document.getElementById("modalAlert").style.display = "none";
    }
    generate(title, description, canEscape, button1, button2, button3, button1Text, button2Text, button3Text) {
        this.setTitle(title);
        this.setDescription(description);
        this.setCanEscape(canEscape);
        this.setButton(1, button1, button1Text);
        this.setButton(2, button2, button2Text);
        this.setButton(3, button3, button3Text);
        this.displayModal();
    }
}
/*onLoad*/
window.addEventListener("load", function () { // Get the modal
    let modalLayer = document.getElementById("modalAlert");
    let btn = document.getElementById("myBtn");
    let btn2 = document.getElementById("myBtn2");
    let closeButton = document.getElementsByClassName("modalClose")[0];
    let modalSVG = document.getElementById("modalSVG");
    let alertManager = new modalAlertManager(modalSVG);
    let svgObject = document.getElementById('mechOutline').contentDocument;
    let mechSVG = svgObject.getElementById('mechSVG');
    alertManager.setLoadingAnim(mechSVG);

    // Test Button
    btn.onclick = function () {
      alertManager.getButton(1).addEventListener("pointerup", alertManager.forceHideModal);
      alertManager.generate("Sample Modal Alert", "You can close this window now.", true, true, false, false, "Close", "button2Text", "button3Text");
    }
    btn2.onclick = function () {
      alertManager.getButton(1).addEventListener("pointerup", modalSpam1);
      alertManager.generate("Nya Nya!", "You can't close this box uwu", false, true, false, false, "What?", "button2Text", "button3Text");
    }
    function modalSpam1(){
      alertManager.forceHideModal();
      alertManager.getButton(1).removeEventListener("pointerup", modalSpam1);
      alertManager.getButton(2).addEventListener("pointerup", modalSpam2);
      alertManager.generate("NYAAAAAAAAA", "I said you can't close this box! UWU!", false, false, true, false, "What?", "NOOOOO!", "button3Text");
    }
    function modalSpam2(){
      alertManager.getButton(2).removeEventListener("pointerup", modalSpam2);
      alertManager.getButton(3).addEventListener("pointerup", modalSpam3);
      alertManager.generate("GIVE UP, MORTAL!", "Give up now or lose your soul, mind, and body forever (a really long time)!", false, false, false, true, "What?", "NOOOOO!", "I give!");
    }
    function modalSpam3(){
      alertManager.getButton(3).removeEventListener("pointerup", modalSpam3);
      alertManager.generate("Fine...", "You may go now.", true, true, true, false, "Thanks!", "Never!", "Turtles");
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
});
