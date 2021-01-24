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
//progress bar window
var progressBar = null;
//opened documents list
var openedDocuments = app.documents;

function setup(){
    //no document opened
    if(openedDocuments.length < 1){
        alert("You need to have at least one open document.", title="Error");
        return false;
    }

    //less than 2 layer => unable to run
    if(app.activeDocument.layers.length < 2){
        alert("Unable to run the script: you need to have a watermark\nand another layer on the active document", title="Error");
        return false;
    }

    else return true;
}

//Create UI to setup the script
function createUI(){
    win = new Window("dialog", "Watermark setter");
    win.orientation = "column";

    //____________________________________________________________________
    //Create the border spacing panel
    win.offsetPanel = win.add("panel", undefined, "Border offset");
    win.offsetPanel.alignment = "fill";

        //Horizontal offset
        win.offsetPanel.hGrp = win.offsetPanel.add("group", undefined);
        win.offsetPanel.hGrp.orientation = "row";

            win.offsetPanel.hGrp.add("statictext", undefined, "H");
            win.offsetPanel.hGrp.hOffsetValue = win.offsetPanel.hGrp.add("edittext", undefined);
            win.offsetPanel.hGrp.hOffsetValue.text = 0;
            win.offsetPanel.hGrp.hOffsetValue.addEventListener("change", function(evt){setHValue(evt, hValue)});
            win.offsetPanel.hGrp.add("statictext", undefined, "px");

        //Vertical offset
        win.offsetPanel.vGrp = win.offsetPanel.add("group", undefined);
        win.offsetPanel.vGrp.orientation = "row";

            win.offsetPanel.vGrp.add("statictext", undefined, "V");
            win.offsetPanel.vGrp.vOffsetValue = win.offsetPanel.vGrp.add("edittext", undefined);
            win.offsetPanel.vGrp.vOffsetValue.text = 0;
            win.offsetPanel.vGrp.vOffsetValue.addEventListener("change", function(evt){setHValue(evt, vValue)});
            win.offsetPanel.vGrp.add("statictext", undefined, "px");

        //Link both offsets values or not
        win.offsetPanel.linkCheck = win.offsetPanel.add("checkbox", undefined, "Keep linked");
        win.offsetPanel.linkCheck.addEventListener("click", switchLink);

    //____________________________________________________________________
    //Create the localisation panel for the watermark
    win.markLoc = win.add("panel", undefined, "Watermark corner");
    win.markLoc.orientation = 'column';
    //win.markLoc.alignment = "fill";

        win.markLoc.radioGrp = win.markLoc.add("group", [0, 0, 190, 100]);
        //win.markLoc.radioGrp.orientation = "column";

            win.markLoc.radioGrp.alignTopLeft = win.markLoc.radioGrp.add("radiobutton", [0, 0, 15, 15], "");
            //win.markLoc.radioGrp.alignTopLeft.alignment = "left";
            win.markLoc.radioGrp.alignTopLeft.tag = "TL";
            win.markLoc.radioGrp.alignTopLeft.addEventListener("click", switchCorner);

            win.markLoc.radioGrp.alignTopRight = win.markLoc.radioGrp.add("radiobutton", [175, 0, 15, 15], "");
            //win.markLoc.radioGrp.alignTopRight.locatioalignmentn = "right"
            win.markLoc.radioGrp.alignTopRight.tag = "TR";
            win.markLoc.radioGrp.alignTopRight.addEventListener("click", switchCorner);

            win.markLoc.radioGrp.alignBottomLeft = win.markLoc.radioGrp.add("radiobutton", [0, 85, 15, 15], "");
            //win.markLoc.radioGrp.alignBottomLeft.alignment = "left";
            win.markLoc.radioGrp.alignBottomLeft.tag = "BL";
            win.markLoc.radioGrp.alignBottomLeft.addEventListener("click", switchCorner);

            win.markLoc.radioGrp.alignBottomRight = win.markLoc.radioGrp.add("radiobutton", [175, 85, 15, 15], "");
            //win.markLoc.radioGrp.alignBottomRight.alignment = "right";
            win.markLoc.radioGrp.alignBottomRight.tag = "BR";
            win.markLoc.radioGrp.alignBottomRight.addEventListener("click", switchCorner);
            win.markLoc.radioGrp.alignBottomRight.value = true;

    //____________________________________________________________________
    //Create a dropdown list to select the layer to use as
    win.dropList = win.add("DropDownList", undefined, getLayerList());
    win.dropList.title = "Watermark  selection";
    win.dropList.selection = win.dropList.items[0];
    win.dropList.alignment = "fill";

    //____________________________________________________________________
    win.confirmBtnGrp = win.add("group", undefined);
    //win.confirmBtnGrp.alignment = "fill";

        win.confirmBtnGrp.okBtn = win.confirmBtnGrp.add("button", undefined, "Ok", {name: "ok"});
        win.confirmBtnGrp.okBtn.onClick = WaterMarkSetter;
        
        win.confirmBtnGrp.okBtn = win.confirmBtnGrp.add("button", undefined, "Apply to all");
        win.confirmBtnGrp.okBtn.onClick = WaterMarkSetterAll;

        win.confirmBtnGrp.cancelBtn = win.confirmBtnGrp.add("button", undefined, "Cancel", {name: "cancel"});

    win.show();
}

function createProgressBar(){
    var pgb = new Window("palette", "Processing...");

    pgb.bar = pgb.add("progressbar", undefined);
    pgb.bar.value = 0;

    pgb.show();

    progressBar = pgb;
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

//Setter for h/vValue
function setHValue(evt, vhValue) {
    var value = parseInt(evt.currentTarget.text, 10);
    if (!isNaN(value)) {
        vhValue = value;
        evt.currentTarget.text = value.toString();
        testLink(value);
    } else {
        alert("Invalid value: please enter a valid number");
        evt.currentTarget.text = vhValue.toString();
    }
}

//Event dispatch when the linkCheck is switched
function switchLink(evt) {
    if (evt.currentTarget.value) {
        win.offsetPanel.vGrp.vOffsetValue.text = win.offsetPanel.hGrp.hOffsetValue.text;
        vValue = hValue;
    }
}

//set factor signs when the corner selection change
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
function getLayerList() {
    var items = [];

    for (var i = 0; i < app.activeDocument.layers.length; i++) {
        items.push(app.activeDocument.layers[i].name);
    }

    return items;
}

//Initialize variable needed to the script
function Initialization() {
    waterMarkLayer = app.activeDocument.layers.getByName(win.dropList.selection);
    vValue = parseInt(win.offsetPanel.vGrp.vOffsetValue.text, 10);
    hValue = parseInt(win.offsetPanel.hGrp.hOffsetValue.text, 10);
    waterMarkLayer.cut();
}

//Set watermark for active document
function WaterMarkSetter() {
    Initialization();
    app.activeDocument.suspendHistory("Watermark setter", "process()");
    win.close();
}

//Set a watermark for all opened documents
function WaterMarkSetterAll() {
    createProgressBar();
    Initialization();

    for (var i = 0; i < openedDocuments.length; i++) {
        var currentDoc = openedDocuments[i];
        app.activeDocument = currentDoc;

        currentDoc.suspendHistory("Watermark setter", "process()");

        progressBar.bar.value += (100 / openedDocuments.length - 1) * i;
        progressBar.show();
    }

    win.close();
    progressBar.close();
}

//main process of setting the watermark to the selected corner
function process(){
    var translateX;
    var translateY;
    var currentDoc = app.activeDocument
    var copiedLayer = currentDoc.paste();
    copiedLayer.name = "Watermark";
    //calculate the width and height of the copiedLayer
    //[0, 1, 2, 3] => [Ax, Ay, Bx, By] => [TLx, TLy, BRx, BRy]
    var clWidth = copiedLayer.bounds[2] - copiedLayer.bounds[0];
    var clHeight = copiedLayer.bounds[3] - copiedLayer.bounds[1];
    //set the top left corner of the watermark on the selected corner
    translateX = (currentDoc.width - copiedLayer.bounds[0]) * facteurH;
    translateY = (currentDoc.height - copiedLayer.bounds[1]) * facteurV;
    //positionning correctly watermark in workspace
    translateX -= clWidth * facteurH;
    translateY -= clHeight * facteurV;
    //applying offset
    translateX -= hValue * facteurH;
    alert(hValue*facteurH);
    translateY -= vValue * facteurV;

    copiedLayer.translate(translateX, translateY);
}

if(setup())
createUI();
