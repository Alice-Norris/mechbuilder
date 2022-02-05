window.addEventListener("load", function() {
    //get svg xml document
    var svgObject = document.getElementById('mechOutline').contentDocument;
    //get svg tag as object
    var mechSVG = svgObject.getElementById('mechSVG');
    //debug output
    console.log(mechSVG);
    //add event listener to respond to click
    mechSVG.addEventListener('pointerdown', function (event) {
        console.log(event.target);
        if (event.target.closest('stroke')) return;
        //call toggleComponentGroup
        deselectComponent(mechSVG);
        var selectionGroup = event.target.getAttributeNS(null, 'class')
        if (selectionGroup != null) {
          console.log(selectionGroup);
          var pathGroup = mechSVG.getElementById(selectionGroup);
          console.log(pathGroup);
          selectComponent(pathGroup);
        }
    }, false);
  });
  function selectComponent(pathGroup) {
    var pathArray = pathGroup.getElementsByTagName("path");
    console.log('selecting '+pathGroup.getAttributeNS(null, 'id'));
    pathGroup.setAttributeNS(null, 'class', 'selected')
    pathArray.item(0).setAttributeNS(null, 'stroke', '#ffffff');
  }
  function deselectComponent(mechSVG){
    var selected = mechSVG.querySelectorAll(".selected");
    if (selected.length > 0) {
      console.log('deselecting '+selected.item(0).getAttributeNS(null, 'id'));
      var pathArray = selected.item(0).getElementsByTagName("path");
      selected.item(0).setAttributeNS(null, 'class', 'enabled')
      pathArray.item(0).setAttributeNS(null, 'stroke', '#816c3f');
    }
  }