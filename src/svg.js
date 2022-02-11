/*classes*/
class svgButton {
  constructor(buttonTemplate, buttonNumber, buttonText, buttonEventCallback){
    console.log("new button instantiated");
    this.buttonTemplate = buttonTemplate;
    this.button = buttonTemplate.cloneNode(true);
    this.button.setAttributeNS(null,"visibility","visible");
    this.button.setAttributeNS(null,"class","inputButton");
    this.rectangle = this.button.getElementsByClassName("modalButton")[0];
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
    this.rectangle.setAttribute("tabindex", 1+buttonNumber);
    this.rectangle.setAttribute("id", `${this.id}Rectangle`);
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
    this.rectangle.addEventListener("pointerup", this.eventCallback);
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
        this.input = null;
        this.buttons.push(this.svgObject.getElementById("buttonTemplate1"));
        this.setButton(1, true, "Close", this.forceHideModal);
        this.setInput(true, "Save as:");
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
    setInput(boolean, string){
      this.input = boolean;
      this.svgObject.getElementById("modalFormLabel").innerHTML = string;
      this.setVisibility(this.svgObject.getElementById("modalFormInput"), boolean);
      if(boolean){this.svgObject.getElementById("htmlObject").setAttributeNS(null,"height","300")}
      else{this.svgObject.getElementById("htmlObject").setAttributeNS(null,"height","375")}
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
    setVisibility(element, boolean){
      if(boolean){
        element.setAttributeNS(null, "visibility", "visible");
      }
      else{
        element.setAttributeNS(null, "visibility", "hidden")
      }
    }
    displayModal (event) {
      document.getElementById("modalLayer").style.display = "block";
      if(event){event.preventDefault()};
      if(this.input){console.log("focusing textbox");this.svgObject.getElementById("modalInputElement").focus();}
      else{
        if(this.svgObject.querySelectorAll(".inputButton .modalButton")[0]){
          this.svgObject.querySelectorAll(".inputButton .modalButton")[0].focus();
        }}
      let focusableElements = document.querySelectorAll("a,select,input");
      for(let element of focusableElements){
        element.setAttribute("tabindex","-1");
      }
    }
    hideModal () {
      if(this.canEscape){
        document.getElementById("modalLayer").style.display = "none";
        let focusableElements = document.querySelectorAll("a,select,input");
        for(let element of focusableElements){
        element.setAttribute("tabindex","0");
        }
      } else{
        let animation1 = this.svgObject.getElementById("animFrame1");
        animation1.beginElement();}
      }
    forceHideModal() {
      document.getElementById("modalLayer").style.display = "none";
      let focusableElements = document.querySelectorAll("a,select,input");
      for(let element of focusableElements){
        element.setAttribute("tabindex","0");
      }
    }
    generate(event, title, description, canEscape, inputNeeded, inputLabelText, button1, button1Text, callback1, button2, button2Text, callback2, button3, button3Text, callback3) {
        this.setTitle(title);
        this.setDescription(description);
        this.setCanEscape(canEscape);
        this.setButton(1, button1, button1Text, callback1);
        this.setButton(2, button2, button2Text, callback2);
        this.setButton(3, button3, button3Text, callback3);
        this.setInput(inputNeeded, inputLabelText);
        this.displayModal(event);
        return this;
    }
    alert(title, description, canEscape, event){
      if(canEscape){
      this.generate(event, title, description, canEscape, false, null, true, "OK", this.hideModal);
      }
      else{
        this.generate(event, title, description, canEscape);
      }
    }
}
module.exports = {modalAlertManager};