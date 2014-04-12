$(document).ready(function () {
    /*$("#compiled").append('<div id="BLOCK" data-density="100" data-friction="2" data-restitution="2" data-static="true" class="block" style="left: 170px; top: 140px;"> </div>');

    var shapes = "#ONE, #TWO, #THREE, #FOUR, #FIVE, #SIX, #SEVEN, #EIGHT, #NINE, #TEN, #BLOCK, #ELEVEN";
    var box2dInstance = new Box2Div ({
        debug:true,
        density:20,
        friction:2,
        restitution:0.2,
        gravityX:0,
        gravityY:10,
        container:'#compiled',
        ground:{
            top:'#ground_top',
            right:'#ground_right',
            bottom:'#ground_bottom',
            left:'#ground_left'
        },
        shapes:shapes,
        setMouse:true
    });

    box2dInstance.impulseObject ("#TWO", {x:0, y:jQuery("#TWO").offset ().left}, {x:91, y:0});
    box2dInstance.onContact (function (A, B){
        if (!A.isGround && A.id != "#BLOCK") $(A.id).css("background-color", ("#"+(Math.random()*0xFFFFFF<<0).toString(16)));
        if (B.id == "#BLOCK") {
            box2dInstance.destroyElement (A.id);
            $(A.id).hide(500);
        }
    });

    box2dInstance.onContact (function (A, B){
        //console.log(A);
    });

    box2dInstance.onPause (function (){
        console.log("pause");
    });

    box2dInstance.onClickElement (function (itemClicked){
        console.log(itemClicked);
    });

    var newId = 0;
    box2dInstance.onPlay (function (){
        newId ++;
        $("#compiled").append ('<div id="div' +newId+ '" class="square" style="left: 330px; top: 90px;"><p>:)</p></div>');
        box2dInstance.addElement ("#div"+newId);
    });

    box2dInstance.distanceLink ("#FOUR", "#FIVE");
    box2dInstance.distanceLink ("#BLOCK", "#THREE",{
        joinID:"block-three",
        lowerAngle:-45,
        upperAngle:45,
        maxMotorTorque:100,
        motorSpeed:10,
        enableMotor:true
    });

    setTimeout(function(){
        "use strict";
        box2dInstance.play ();
    },1000);*/



    reset ();

    $("#btn_reset").click(function(){
        location.reload();
    });

    $("#btn_exec").click(function(){
        $(this).unbind("click");
        $(this).removeClass('buton');
        $(this).addClass('visited');
        string = $("#mainCode textarea").val();
        $("body").append('<script type="text/javascript">function exec (){'+ string +'}</script>');
        exec ();
    });

    function reset (){
        $("textarea").val('');
        var defaultCode = '$("#compiled").append(\'<div id="BLOCK" data-density="100" data-friction="2" data-restitution="2" data-static="true" class="block" style="left: 170px; top: 140px;"> </div>\');\n\n';
        defaultCode += 'var shapes = "#ONE, #TWO, #THREE, #FOUR, #FIVE, #SIX, #SEVEN, #EIGHT, #NINE, #TEN, #BLOCK, #ELEVEN";\n';
        defaultCode += 'var box2dInstance = new Box2Div({\n';
        defaultCode += '    debug: true,\n';
        defaultCode += '    density: 20,\n';
        defaultCode += '    friction: 2,\n';
        defaultCode += '    gravityX: 0,\n';
        defaultCode += '    gravityY: 10,\n';
        defaultCode += '    container: "#compiled",\n';
        defaultCode += '    ground: {\n';
        defaultCode += '        top: \'#ground_top\',\n';
        defaultCode += '        right: \'#ground_right\'\n,';
        defaultCode += '        bottom: \'#ground_bottom\',\n';
        defaultCode += '        left: \'#ground_left\'\n';
        defaultCode += '    },\n';
        defaultCode += '    shapes: shapes,\n';
        defaultCode += '    setMouse: true\n';
        defaultCode += '});\n';
        defaultCode += '\n';
        defaultCode += 'box2dInstance.impulseObject("#TWO", {x: 0, y: jQuery("#TWO").offset().left}, {x: 91, y: 0});\n';
        defaultCode += 'box2dInstance.onContact(function (A, B) {\n';
        defaultCode += '    if (!A.isGround && A.id != "#BLOCK") $(A.id).css("background-color", ("#" + (Math.random() * 0xFFFFFF << 0).toString(16)));\n';
        defaultCode += '    if (B.id == "#BLOCK") {\n';
        defaultCode += '        box2dInstance.destroyElement(A.id);\n';
        defaultCode += '        $(A.id).hide(500);\n';
        defaultCode += '    }\n';
        defaultCode += '});\n';
        defaultCode += '\n';
        defaultCode += 'box2dInstance.onContact(function (A, B) {\n';
        defaultCode += '    //console.log(A);\n';
        defaultCode += '});\n';
        defaultCode += '\n';
        defaultCode += 'box2dInstance.onPause(function () {\n';
        defaultCode += '    console.log("pause");\n';
        defaultCode += '});\n';
        defaultCode += '\n';
        defaultCode += 'box2dInstance.onClickElement(function (itemClicked) {\n';
        defaultCode += '    console.log(itemClicked);\n';
        defaultCode += '});\n';
        defaultCode += '\n';
        defaultCode += 'var newId = 0;\n';
        defaultCode += 'box2dInstance.onPlay(function () {\n';
        defaultCode += '    newId++;\n';
        defaultCode += '    $("#compiled").append(\'<div id="div\' + newId + \'" class="square" style="left: 330px; top: 90px;"><p>:)</p></div>\');\n';
        defaultCode += '    box2dInstance.addElement("#div" + newId);\n';
        defaultCode += '});\n';
        defaultCode += '\n';
        defaultCode += 'box2dInstance.distanceLink("#FOUR", "#FIVE");\n';
        defaultCode += 'box2dInstance.distanceLink("#BLOCK", "#THREE", {\n';
        defaultCode += '    joinID: "block-three",\n';
        defaultCode += '    lowerAngle: -45,\n';
        defaultCode += '    upperAngle: 45,\n';
        defaultCode += '    maxMotorTorque: 100,\n';
        defaultCode += '    motorSpeed: 10,\n';
        defaultCode += '    enableMotor: true\n';
        defaultCode += '});\n';
        defaultCode += '\n';
        defaultCode += '\n';
        defaultCode += 'box2dInstance.play();\n';

		$("textarea").val(defaultCode);
		
	}
	
	//-------------------------------------------------------------------------------------------

});
