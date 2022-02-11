/*classes*/
class svgButton {
  constructor(buttonTemplate, buttonNumber, buttonText, buttonEventCallback){
    console.log("new button instantiated");
    this.buttonTemplate = buttonTemplate;
    this.button = buttonTemplate.cloneNode(true);
    this.enabled = null;
    this.number = null;
    this.id = null;
    this.text = null;
    this.eventCallback = null;
    this.setButtonNumber(buttonNumber);
    this.setText(buttonText);
    this.setEventCallback(buttonEventCallback);
    this.disable();
  }
  setButtonNumber(buttonNumber){
    let yInterval = parseInt(this.buttonTemplate.getAttributeNS(null,"height"));
    let yBaseline = parseInt(this.buttonTemplate.getAttributeNS(null,"y"));
    let newY = yBaseline-(yInterval*(buttonNumber-1));
    this.number = buttonNumber;
    this.id = `button${buttonNumber}`;
    this.button.setAttributeNS(null,"id",this.id);
    this.button.setAttributeNS(null,"y",newY);
  }
  setText(buttonText){
    this.text = buttonText;
    this.button.getElementsByTagName("text")[0].innerHTML = buttonText;
  }
  setEventCallback(buttonEventCallback){
    if(this.eventCallback){this.unsetEventCallback();}
    this.eventCallback = buttonEventCallback;
    this.button.addEventListener("pointerup", this.eventCallback);
  }
  unsetEventCallback(){
    this.button.removeEventListener("pointerup", this.eventCallback);
  }
  disable(){
    this.unsetEventCallback();
    this.button.setAttributeNS(null, "visibility", "hidden");
    this.enabled = false;
  }
  enable(){
    this.setEventCallback(this.eventCallback);
    this.button.setAttributeNS(null, "visibility", "visible");
    this.enabled = true;
  }
  setTemplate (buttonTemplate){
    let parent = this.button.parentElement;
    this.buttonTemplate = buttonTemplate;
    parent.removeChild(this.button);
    this.button = buttonTemplate.cloneNode(true);
    this.setButtonNumber(this.buttonNumber);
    this.setText(this.buttonText);
    this.setEventCallback(this.buttonEventCallback);
    parent.appendChild(this.button);
  }
  remove(){
    this.button.parentElement.removeChild(this.button);
  }
}
class modalAlertManager {
    constructor(svgObject) {
        this.title = null;
        this.description = null;
        this.canEscape = false;
        this.svgObject = svgObject;
        this.ns = "http://www.w3.org/2000/svg";
        this.loadingAnim = null;
        this.buttons = [];
        this.buttons.push(this.svgObject.getElementById("buttonTemplate1"));
        this.setButton(1, true, "Close", this.forceHideModal);
    }
    setLoadingAnim(animSVG) {
      this.loadingAnim = animSVG.cloneNode(true);
      let discardLayer = animSVG.getElementById("transformLayer");
      discardLayer.setAttributeNS(null, "id", "discardLayer");
      discardLayer.setAttributeNS(null, "transform", "");
      this.loadingAnim.setAttributeNS(null, "id", "mechGoesSpinny");
      let animation = this.loadingAnim.getElementById("loadingAnim");
      animation.setAttributeNS(null, "id", "rightRoundBaby");
      this.loadingAnim.setAttributeNS(null, "height", "7.5");
      this.loadingAnim.setAttributeNS(null, "width", "7.5");
      this.loadingAnim.setAttributeNS(null, "x", "0");
      this.loadingAnim.setAttributeNS(null, "y", "0");
      let structurePaths = this.loadingAnim.getElementsByClassName("structurePath");
      while(structurePaths.length > 0){
        structurePaths[0].parentNode.removeChild(structurePaths[0]);
      }
      let group = this.loadingAnim.getElementById("animationGroup")
      group.setAttributeNS(null, "id", "animationGronp");
      let cancelArea = this.svgObject.getElementById("cancelArea");
      this.setVisibility(this.loadingAnim, !this.getCanEscape());
      cancelArea.prepend(this.loadingAnim);
      animation = this.loadingAnim.getElementById("rightRoundBaby");
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
        this.svgObject.getElementById("headerAreaText").innerHTML = string;
        this.title = string;
    }
    getTitle() {
        return this.title;
    }
    setDescription(string) {
        this.svgObject.getElementById("descriptionAreaText").innerHTML = string;
        this.description = string;
    }
    getDescription() {
        return this.description;
    }
    setCanEscape(boolean) {
        this.canEscape = boolean;
        this.setVisibility(this.svgObject.getElementById("cancelPath"), boolean);
        if(this.loadingAnim){this.setVisibility(this.loadingAnim, !boolean);}
    }
    getCanEscape() {
        return this.canEscape;
    }
    setButton(buttonNumber, enabled, buttonText, buttonEventCallback) {
      console.log("setting button number: "+buttonNumber);
      if(buttonNumber == 0){buttonNumber = 1;}
      if(this.buttons[buttonNumber]){
        let currentButton = this.buttons[buttonNumber];
        currentButton.setText(buttonText);
        currentButton.setEventCallback(buttonEventCallback);
        if(enabled){currentButton.enable();}
        else{currentButton.disable();}
      }else{
      let newButton = new svgButton(this.buttons[0], buttonNumber, buttonText, buttonEventCallback);
      if(enabled){newButton.enable();}
      this.buttons[buttonNumber] = newButton;
      this.svgObject.getElementById("inputArea").appendChild(newButton.button);
      }
    }
    getButton(buttonNumber){
      return this.buttons[buttonNumber];
    }
    disableButtons(){

    }
    setVisibility(element, boolean){
      if(boolean){
        element.setAttributeNS(null, "visibility", "visible");
      }
      else{
        element.setAttributeNS(null, "visibility", "hidden")
      }
    }
    displayModal () {
      document.getElementById("modalLayer").style.display = "block";
    }
    hideModal () {
      if(this.canEscape){
        document.getElementById("modalLayer").style.display = "none";
      } else{
        let animation1 = this.svgObject.getElementById("animFrame1");
        animation1.beginElement();}
      }
    forceHideModal() {
      document.getElementById("modalLayer").style.display = "none";
    }
    buttonData(){
      let array = [];

    }
    generate(title, description, canEscape, button1, button2, button3, button1Text, button2Text, button3Text, callback1, callback2, callback3) {
        this.setTitle(title);
        this.setDescription(description);
        this.setCanEscape(canEscape);
        this.setButton(1, button1, button1Text, callback1);
        this.setButton(2, button2, button2Text, callback2);
        this.setButton(3, button3, button3Text, callback3);
        this.displayModal();
    }
}
/*onLoad*/
window.addEventListener("load", function () { // Get the modal
    let modalLayer = document.getElementById("modalLayer");
    let btn = document.getElementById("myBtn");
    let closeButton = document.getElementById("cancelPath");
    let modalSVG = document.getElementById("modalSVG");
    let alertManager = new modalAlertManager(modalSVG);
    let mechOutline = document.getElementById('mechOutline');
    console.log(mechOutline.contentDocument);
    let mechSVG = mechOutline.contentDocument.getElementById('mechSVG');
    alertManager.setLoadingAnim(mechSVG);

    // Test Button
    btn.onclick = function () {
      alertManager.generate("Unsaved Changes!", "You've made changes to this mech that you haven't exported. Would you like to save this mech definition?", true, true, true, false, "Cancel", "Save", "button3Text", testButtons, null, null);;
    }
    // When the user clicks on <span> (x), close the modal
    closeButton.onclick = function () {
        closeModal();
    }
    // When the user clicks anywhere outside of the modal, close it
    window.onclick = function (event) {
      //console.log(event.target);
        if (event.target == modalLayer) {
          closeModal();
        }
    }
    function closeModal(){
      alertManager.hideModal();
    }
    function testButtons(){
      console.log("button test triggered");
      alertManager.setButton(1, true, "Close", closeModal);
      alertManager.setButton(2, true, "Change", testFormChange);
      alertManager.setButton(3, true, "Disable", disableButtons);
    }
    function testFormChange(){
      let sampleText = "chaos+nova together 4ever ";
      alertManager.setTitle(sampleText);
      sampleText = sampleText+sampleText;
      sampleText = sampleText+sampleText;
      sampleText = sampleText+sampleText;
      sampleText = sampleText+sampleText;
      sampleText = sampleText+sampleText;
      alertManager.setDescription(sampleText);
      alertManager.setCanEscape(true);
    }
    function disableButtons(){
      alertManager.getButton(1).disable();
      alertManager.getButton(2).disable();
      alertManager.getButton(3).disable();
    }
});
