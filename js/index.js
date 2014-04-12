$(document).ready(function () {
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
		defaultCode += 'var box2dInstance = new Box2Div ();\n';
		
		defaultCode += 'box2dInstance.set_density (20);\n';
		defaultCode += 'box2dInstance.set_friction (2);\n';
		defaultCode += 'box2dInstance.set_restitution (0.2);\n';
		defaultCode += 'box2dInstance.set_gravity_X (0);\n';
		defaultCode += 'box2dInstance.set_gravity_Y (10);\n';
		defaultCode += '//box2dInstance.set_mouse ();//default false \n\n';
		
		defaultCode += 'box2dInstance.set_ground ("#ground_top","#ground_right","#ground_bottom","#ground_left");\n';
		defaultCode += 'box2dInstance.set_container("#compiled");\n';
		defaultCode += 'box2dInstance.set_content(shapes);\n\n';
		
		defaultCode += 'box2dInstance.on_start (function(){\n';
		defaultCode += '    jQuery("#ONE").css("background-color", "red");\n';
		defaultCode += '    box2dInstance.impulseObject ("#TWO", {x:0, y:jQuery("#TWO").offset ().left}, {x:91, y:0});\n';
		defaultCode += '});\n\n';
		
		defaultCode += 'box2dInstance.on_contact (function (A, B){\n';
		defaultCode += '    //console.log(A);\n';
		defaultCode += '    //console.log(B);\n';
		defaultCode += '    if (!A.isGround && A.id != "#BLOCK") $(A.id).css("background-color", ("#"+(Math.random()*0xFFFFFF<<0).toString(16)));\n';
		defaultCode += '    if (B.id == "#BLOCK") {\n';
		defaultCode += '        box2dInstance.destroy_element (A.id);\n';
		defaultCode += '        $(A.id).hide(500);\n';
		defaultCode += '     }\n';
		defaultCode += '    if (A.id == "#BLOCK") {\n';
		//defaultCode += '        box2dInstance.destroy_element (B.id);\n';
		//defaultCode += '        $(B.id).hide(500);\n';
		defaultCode += '     }\n';
		defaultCode += '});\n\n';
		//<div id="NEW" class="square" style="left: 330px; top: 90px;"><p>:)</p></div>
		
		defaultCode += 'box2dInstance.on_pause (function (){\n';
		defaultCode += '    console.log("pause");\n';
		defaultCode += '});\n\n';
		
		defaultCode += 'box2dInstance.get_clicked (function (itemClicked){\n';
		defaultCode += '    console.log(itemClicked);\n';
		defaultCode += '});\n\n';
		
		defaultCode += 'var newId = 0;\n';
		defaultCode += 'box2dInstance.on_play (function (){\n';
		defaultCode += '    newId ++;\n';
		defaultCode += '    $("#compiled").append (\'<div id="div\' +newId+ \'" class="square" style="left: 330px; top: 90px;"><p>:)</p></div>\');\n';
		defaultCode += '    box2dInstance.addElement ("#div"+newId);\n';
		defaultCode += '});\n\n';
		
		defaultCode += 'box2dInstance.distanceLink ("#FOUR", "#FIVE");\n';
		defaultCode += 'box2dInstance.distanceLink ("#BLOCK", "#THREE",{\n';
		defaultCode += '    joinID:"block-three", \n';
		defaultCode += '    lowerAngle:-45, \n';
		defaultCode += '    upperAngle:45,\n';
		defaultCode += '    maxMotorTorque:100,\n';
		defaultCode += '    motorSpeed:10,\n';
		defaultCode += '    enableMotor:true\n';
		defaultCode += '});\n\n';
		
		defaultCode += 'box2dInstance.start (true);\n\n';
		
		/*defaultCode += 'var isPaused = false;\n';
		defaultCode += 'setInterval (function(){\n';
		defaultCode += '    if (!isPaused){\n';
		defaultCode += '        box2dInstance.pause ();\n';
		defaultCode += '        isPaused = true;\n';
		defaultCode += '        alert ("paused!");\n';
		defaultCode += '    }\n';
		defaultCode += '    else{\n';
		defaultCode += '        box2dInstance.play ();\n';
		defaultCode += '        isPaused = false;\n';
		defaultCode += '        alert ("continue!");\n';
		defaultCode += '    }\n';
		defaultCode += '},5000);\n';*/
		defaultCode += '\n';
		defaultCode += '\n';
		defaultCode += '\n';
		defaultCode += '\n';
		defaultCode += '\n';
		
		$("textarea").val(defaultCode);	
		
	}
	
	//-------------------------------------------------------------------------------------------
	
});
