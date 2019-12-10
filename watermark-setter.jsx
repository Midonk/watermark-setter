//Switch units to pixels
app.preferences.rulerUnits = Units.PIXELS;

//horizontal offset value
var hValue = 0;
//vertical offset value
var vValue = 0;
//layer use as watermark
var waterMarkLayer;
//horizontal factor used to calculate the offset and the watermark placement
var facteurH = 1;
//vertical factor used to calculate the offset and the watermark placement
var facteurV = 1;
//Interface window
var win = null;
var progressBar = null;

//Create UI to setup the script
function createUI(){
    win = new Window("dialog", "new window");

    //Create the border spacing panel
    win.offsetPanel = win.add("panel", undefined, "Border offset");

    //Horizontal offset
    win.offsetPanel.hGrp = win.offsetPanel.add("group", undefined);
    win.offsetPanel.hGrp.orientation = "row";

    win.offsetPanel.hGrp.add("statictext", undefined, "H");
    win.offsetPanel.hGrp.hOffsetValue = win.offsetPanel.hGrp.add("edittext", undefined);
    win.offsetPanel.hGrp.hOffsetValue.text = 0;
    win.offsetPanel.hGrp.hOffsetValue.addEventListener("change", setHValue);
    win.offsetPanel.hGrp.add("statictext", undefined, "px");

    //Vertical offset
    win.offsetPanel.vGrp = win.offsetPanel.add("group", undefined);
    win.offsetPanel.vGrp.orientation = "row";

    win.offsetPanel.vGrp.add("statictext", undefined, "V");
    win.offsetPanel.vGrp.vOffsetValue = win.offsetPanel.vGrp.add("edittext", undefined);
    win.offsetPanel.vGrp.vOffsetValue.text = 0;
    win.offsetPanel.vGrp.vOffsetValue.addEventListener("change", setVValue);
    win.offsetPanel.vGrp.add("statictext", undefined, "px");

    //Link both offsets values or not
    win.offsetPanel.linkCheck = win.offsetPanel.add("checkbox", undefined, "Keep linked");
    win.offsetPanel.linkCheck.addEventListener("click", switchLink);

    //Create the localisation panel for the watermark
    win.markLoc = win.add("panel", undefined, "Watermark localisation");
    win.markLoc.orientation = 'column';

    win.markLoc.radioGrp = win.markLoc.add("group", undefined);
    win.markLoc.radioGrp.orientation = 'column';

    win.markLoc.radioGrp.alignTopLeft = win.markLoc.radioGrp.add("radiobutton", undefined, "TL");
    win.markLoc.radioGrp.alignTopLeft.alignement = ["top", "left"];
    win.markLoc.radioGrp.alignTopLeft.tag = "TL";
    win.markLoc.radioGrp.alignTopLeft.addEventListener("click", switchCorner);

    win.markLoc.radioGrp.alignTopRight = win.markLoc.radioGrp.add("radiobutton", undefined, "TR");
    win.markLoc.radioGrp.alignTopRight.alignement = ["top", "right"];
    win.markLoc.radioGrp.alignTopRight.tag = "TR";
    win.markLoc.radioGrp.alignTopRight.addEventListener("click", switchCorner);

    win.markLoc.radioGrp.alignBottomLeft = win.markLoc.radioGrp.add("radiobutton", undefined, "BL");
    win.markLoc.radioGrp.alignBottomLeft.alignement = ["bottom", "left"];
    win.markLoc.radioGrp.alignBottomLeft.tag = "BL";
    win.markLoc.radioGrp.alignBottomLeft.addEventListener("click", switchCorner);

    win.markLoc.radioGrp.alignBottomRight = win.markLoc.radioGrp.add("radiobutton", undefined, "BR");
    win.markLoc.radioGrp.alignBottomRight.alignement = ["bottom", "right"];
    win.markLoc.radioGrp.alignBottomRight.tag = "BR";
    win.markLoc.radioGrp.alignBottomRight.addEventListener("click", switchCorner);
    win.markLoc.radioGrp.alignBottomRight.value = true;

    //Create a dropdown list to select the layer to use as
    win.dropList = win.add("DropDownList", undefined, setListItems());
    win.dropList.title = "Watermark  selection";
    win.dropList.selection = win.dropList.items[0];

    win.confirmBtnGrp = win.add("group", undefined);
    win.confirmBtnGrp.alignChildren = "right";

    win.confirmBtnGrp.okBtn = win.confirmBtnGrp.add("button", undefined, "Ok");
    win.confirmBtnGrp.okBtn.onClick = WaterMarkSetter;

    win.confirmBtnGrp.cancelBtn = win.confirmBtnGrp.add("button", undefined, "Cancel", {name: "cancel"});

    win.show();
}

function createProgressBar(){
    var pgb = new Window("palette", "Processing...");

    pgb.bar = pgb.add("progressbar", undefined);
    pgb.bar.value = 1;

    progressBar = pgb;

    pgb.show();
}

//Test if the link between both value is made or not and set up the interface following it
function testLink(value) {
    if (win.offsetPanel.linkCheck.value) {
        win.offsetPanel.hGrp.hOffsetValue.text = value.toString();
        hValue = value;
        win.offsetPanel.vGrp.vOffsetValue.text = value.toString();
        vValue = value;
    }
}

//Setter for hValue
function setHValue(evt) {
    var value = parseInt(evt.currentTarget.text, 10);
    if (!isNaN(value)) {
        hValue = value;
        evt.currentTarget.text = value.toString();
        testLink(value);
    } else {
        alert("Invalid value: please enter a valid number");
        evt.currentTarget.text = hValue.toString();
    }
}

//Setter for vValue
function setVValue(evt) {
    var value = parseInt(evt.currentTarget.text, 10);
    if (!isNaN(value)) {
        vValue = value;
        evt.currentTarget.text = value.toString();
        testLink(value);
    } else {
        alert("Invalid value: please enter a valid number");
        evt.currentTarget.text = vValue.toString();
    }
}

//Event dispatch when the linkCheck is switched
function switchLink(evt) {
    if (evt.currentTarget.value) {
        win.offsetPanel.vGrp.vOffsetValue.text = win.offsetPanel.hGrp.hOffsetValue.text;
        vValue = hValue;
    }
}

function switchCorner(evt) {
    switch (evt.currentTarget.tag) {
        case "BR":
            facteurH = 1;
            facteurV = 1;
            break;

        case "TL":
            facteurH = -1;
            facteurV = -1;
            break;

        case "BL":
            facteurH = -1;
            facteurV = 1;
            break;

        case "TR":
            facteurH = 1;
            facteurV = -1;
            break;
    }
}

//creating items for dropDownList to choose watermark
function setListItems() {
    var items = [];
    for (var i = 0; i < app.activeDocument.layers.length; i++) {
        items.push(app.activeDocument.layers[i].name);
    }

    return items;
}

//Initialize variable needed to the script
function Initialization() {
    waterMarkLayer = app.activeDocument.layers.getByName(win.dropList.selection);
    waterMarkLayer.copy();
    waterMarkLayer.remove();
    progressBar.bar.value += 5;
}

function WaterMarkSetter() {
    var translateX;
    var translateY;

    createProgressBar();
    Initialization();

    for (var i = 0; i < app.documents.length; i++) {
        var currentDoc = app.documents[i];
        app.activeDocument = currentDoc;

        var copiedLayer = currentDoc.paste();
        copiedLayer.name = "Watermark";
        //calculate the width and height of the copiedLayer
        //[0, 1, 2, 3] => [Ax, Ay, Bx, By] => [TLx, TLy, BRx, BRy]
        var clWidth = copiedLayer.bounds[2] - copiedLayer.bounds[0];
        var clHeight = copiedLayer.bounds[3] - copiedLayer.bounds[1];
        //met le coin haut gauche au corner sélectionné
        translateX = (currentDoc.width - copiedLayer.bounds[0]) * facteurH;
        translateY = (currentDoc.height - copiedLayer.bounds[1]) * facteurV;
        //positionning correctly watermark in workspace
        translateX -= clWidth * facteurH;
        translateY -= clHeight * facteurV;
        //applying offset
        translateX -= hValue * facteurH;
        translateY -= vValue * facteurV;

        copiedLayer.translate(translateX, translateY);

        progressBar.bar.value += (100 - 5) / app.documents.length;
    }

    progressBar.close();
    win.close();
}

createUI();