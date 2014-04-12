//### In your import file, use the following imports:
//<script type="text/javascript" src="$/$.js"></script>
//<script type="text/javascript" src="Box2D/Box2D.js"></script>
//<script type="text/javascript" src="Box2D/Box2Div.js"></script>
//<script type="text/javascript" src="Box2D/$.ui.touch.js"></script>

function Box2Div(options) {
    // IMPORT EVERTHING
    var b2Vec2 = Box2D.Common.Math.b2Vec2;
    var b2BodyDef = Box2D.Dynamics.b2BodyDef;
    var b2Body = Box2D.Dynamics.b2Body;
    var b2FixtureDef = Box2D.Dynamics.b2FixtureDef;
    var b2Fixture = Box2D.Dynamics.b2Fixture;
    var b2World = Box2D.Dynamics.b2World;
    var b2MassData = Box2D.Collision.Shapes.b2MassData;
    var b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape;
    var b2CircleShape = Box2D.Collision.Shapes.b2CircleShape;
    var b2DebugDraw = Box2D.Dynamics.b2DebugDraw;
    var b2MouseJointDef = Box2D.Dynamics.Joints.b2MouseJointDef;
    var b2MouseJoint = Box2D.Dynamics.Joints.b2MouseJoint;
    var b2RevoluteJointDef = Box2D.Dynamics.Joints.b2RevoluteJointDef;
    var b2RevoluteJoint = Box2D.Dynamics.Joints.b2RevoluteJoint;

    //var density = 1.5;
    var friction = 0.3;
    var restitution = 0.3;
    var gravityX = 0;
    var gravityY = 0;
    var onStart = null;
    var isMouse = false;
    var container = 'body';

    var render_loop = null;

    var world = null;
    var bodyList = new Array();
    var jointsList = new Array();
    var FPS = 60; 	// hack (not change [usual fps])
    var itemToDelete = null;
    var playFN = null;
    var pauseFN = null;
    var clickedFN = null;
    var contactFN = null;
    var objA = null;
    var objB = null;
    var currentMouse = null;
    var isPaused = false;
    var isDebug = false;

    var settings = {};
    var defaults = {
        density: 1.5,
        friction: 0.3,
        restitution: 0.3,
        gravityX: 0,
        gravityY: 0,
        onStart: null,
        isMouse: false,
        container: 'body',
        ground:{
            top:null,
            right:null,
            bottom:null,
            left:null
        },
        shapes:[],

        render_loop: null,

        world: null,
        bodyList: [],
        jointsList: [],
        FPS: 60, 	// hack (not change [usual fps])
        itemToDelete: null,
        playFN: null,
        pauseFN: null,
        clickedFN: null,
        contactFN: null,
        objA: null,
        objB: null,
        currentMouse: null,
        isPaused: false,
        isDebug: false
    };

    if (typeof options == 'object') {
        settings = $.extend(defaults, options);
    } else {
        settings = defaults;
    }

//set mouse = to enable selection, default = false (avoid onjects selection)
    Box2Div.prototype.set_mouse = function () {
        isMouse = true;
    }
//set mouse = to enable selection, default = false (avoid onjects selection)
    Box2Div.prototype.get_clicked = function (fn) {
        clickedFN = fn;
    }
//@callback = function who MUST have two parameters to return collition objects
    Box2Div.prototype.on_contact = function (callback) {
        contactFN = callback;
    }
//@id = jQuery selector of the object to destroy
    Box2Div.prototype.destroy_element = function (id) {
        itemToDelete = id;
    }
//@param content = string with the list of the $selectors ej: "#top-content, .class, h1, h2"
    Box2Div.prototype.set_content = function (content) {
        // world creation if it does not exists @see createWorld function
        createWorld();
        // parsing objects list
        $(content).each(function (i, el) {
            bodyList.push(el);
        });
        // create bodies and fixtures
        for (var i = 0; i < bodyList.length; i++) {
            createDivElement($(bodyList[i]), {
                density: settings.density,
                friction: settings.friction,
                restitution: settings.restitution
            });
        }
    }
//@func = function to fire on start event
    Box2Div.prototype.on_start = function (func) {
        onStart = func;
    }
//@func = function to fire on play event
    Box2Div.prototype.on_play = function (func) {
        playFN = func;
    }
//@func = function to fire on pause event
    Box2Div.prototype.on_pause = function (func) {
        pauseFN = func;
    }
//Stop the experience
    Box2Div.prototype.pause = function () {
        isPaused = true;
        clearInterval(render_loop);
        if (pauseFN) pauseFN();
    }
//Play experience after pause it
    Box2Div.prototype.play = function () {
        if (currentMouse != null) world.DestroyJoint(currentMouse);

        if (playFN) playFN();
        if (isPaused) isPaused = false;
        play();
    }
//addElement to the current experience
    Box2Div.prototype.addElement = function (id) {
        if (id) {
            bodyList.push(id);
            createDivElement($(id), {
                density: settings.density,
                friction: settings.friction,
                restitution: settings.restitution
            });
        }
    }
//link two bodies according its original position
    Box2Div.prototype.distanceLink = function (bodyID1, bodyID2, settings) {
        var bodyA = $(bodyID1).data().content;
        var bodyB = $(bodyID2).data().content;

        var jointDef = new b2RevoluteJointDef();
        jointDef.bodyA = bodyA;
        jointDef.bodyB = bodyB;

        jointDef.Initialize(bodyA, bodyB, bodyA.GetPosition());//jointDef.collideConnected = true;

        if (settings) {
            jointDef.enableLimit = true;
            jointDef.referenceAngle = 0;

            if (settings.lowerAngle) {
                var low = settings.lowerAngle / 180;
                jointDef.lowerAngle = low * Math.PI;
            }
            if (settings.upperAngle) {
                var up = settings.upperAngle / 180;
                jointDef.upperAngle = up * Math.PI;
            }
            if (settings.maxMotorTorque) {
                jointDef.maxMotorTorque = settings.maxMotorTorque * FPS;
            }
            if (settings.motorSpeed) {
                var speed = settings.motorSpeed / FPS;
                jointDef.motorSpeed = settings.motorSpeed;
            }
            if (settings.enableMotor) {
                jointDef.enableMotor = true;
            }
        }

        jointDef.collideConnected = true;
        newJoint = world.CreateJoint(jointDef);
        if (settings) {
            newJoint.userData = settings;
            jointsList.push(newJoint);
        }
    }
//@bodyID= jquery selector of the object, @from = initial position, @to position where want to throw
    Box2Div.prototype.impulseObject = function (bodyID, from, to) {

        $(bodyID).data().content.ApplyImpulse(new b2Vec2(to.x, to.y), new b2Vec2(from.x, from.y));
        //$("#ONE").data().content.ApplyImpulse (new b2Vec2(700, 40), $("#ONE").data().content.GetPosition());
    }

// start experience
    Box2Div.prototype.start = function (debug) {
        if (debug) isDebug = true;

        if (onStart)
            onStart();
        //---------
        if (isDebug) {
            var debugDraw = new b2DebugDraw();

            canvas = $('<canvas></canvas>');
            canvas.css('position', 'absolute');
            canvas.css('top', 0);
            canvas.css('left', 0);
            canvas.css('pointer-events', 'none');
            canvas.attr('width', $(window).width());
            canvas.attr('height', $(document).height());

            debugDraw.SetSprite(canvas[0].getContext("2d"));
            debugDraw.SetDrawScale(FPS);
            debugDraw.SetFillAlpha(0.2);
            debugDraw.SetLineThickness(1);
            debugDraw.SetFlags(b2DebugDraw.e_shapeBit | b2DebugDraw.e_jointBit);

            world.SetDebugDraw(debugDraw);
            $('html').append(canvas);
        }

        createWorld();
        // after world creation we set the container
        ground(settings.ground.top);
        ground(settings.ground.right);
        ground(settings.ground.bottom);
        ground(settings.ground.left);

        //--------------------------------------------------------------------------------------------------------------------
        //---------- adding touch event
        // rember import $.ui.touch.js
        $.extend($.support, {
            touch: "ontouchend" in document
        });

        $.fn.addTouch = function () {
            if ($.support.touch) {
                this.each(function (i, el) {
                    el.preventDefault();
                    el.addEventListener("touchstart", iPadTouchHandler, false);
                    el.addEventListener("touchmove", iPadTouchHandler, false);
                    el.addEventListener("touchend", iPadTouchHandler, false);
                    el.addEventListener("touchcancel", iPadTouchHandler, false);
                });
            }
        };

        //--------------------------------------------------------------------------------------------------------------------
        //------ CONTACT (HIT TEST) OBJECTS-----------------------------------------------------------------------------------
        var b2Listener = Box2D.Dynamics.b2ContactListener;
        var listener = new b2Listener;

        listener.BeginContact = function (contact) {
            objA = contact.GetFixtureA().GetUserData();
            objB = contact.GetFixtureB().GetUserData();

            if (contactFN) contactFN(objA, objB);
        }

        listener.EndContact = function (contact) {
            //TODO:
        }

        world.SetContactListener(listener);

        initMouse();
        play();
    }

// world creation, called several times to secure the environment first of all, but it will be handled once only
    function createWorld() {
        if (!world) world = new b2World(new b2Vec2(settings.gravityX, settings.gravityY), true);
    }

//@limit = string selector for ground limit creation
    function ground(limit) {
        //console.log ("density: " + density + " / friction: " + friction + " / restitution: " + restitution);
        if (limit !== "" && limit !== null && limit !== undefined) {

            $(limit).data('origPos', {
                left: $(limit).offset().left,
                top: $(limit).offset().top,
                width: $(limit).outerWidth(),
                height: $(limit).outerHeight()
            });
            // Fixture
            var fixDef = new b2FixtureDef;
            fixDef.density = settings.density;
            fixDef.friction = settings.friction;
            fixDef.restitution = settings.restitution;

            // Shape
            fixDef.shape = new b2PolygonShape;
            fixDef.shape.SetAsBox(
                    $(limit).outerWidth() / 2 / FPS, //half width
                    $(limit).outerHeight() / 2 / FPS //half height
            );

            var data = {
                id: "#" + $(limit).attr("id"),
                class: null,
                isLive: true,
                isGround: true
            };


            if ($(limit).attr("class"))
                data = "." + $(limit).attr("class");

            fixDef.userData = data;

            // Body
            var bodyDef = new b2BodyDef;
            bodyDef.type = b2Body.b2_staticBody;
            bodyDef.position.x = ($(limit).offset().left + $(limit).outerWidth() / 2) / FPS;
            bodyDef.position.y = ($(limit).offset().top + $(limit).outerHeight() / 2) / FPS;
            var body = world.CreateBody(bodyDef);
            body.CreateFixture(fixDef);
        }
    }

//@obj = $selector of the object, @settings = settings
// create body element
    function createDivElement(obj, settings) {
        var fixDef = createFixture(obj, settings);
        // Body
        var bodyDef = new b2BodyDef;
        var isStatic = parseBoolean($(obj).attr("data-static"));

        if (isStatic) {
            bodyDef.type = b2Body.b2_staticBody;
        } else
            bodyDef.type = b2Body.b2_dynamicBody;

        bodyDef.position.x = ($(obj).offset().left + $(obj).outerWidth() / 2) / FPS;
        bodyDef.position.y = ($(obj).offset().top + $(obj).outerHeight() / 2) / FPS;


        //bodyDef.userData = data;

        var body = world.CreateBody(bodyDef);
        body.CreateFixture(fixDef);
        body.userData = fixDef.userData;

        $(obj).data("content", body);

        initMouse(obj);
    }

//@obj = $selector of the object, @settings = settings
//create a fixture and return it
    function createFixture(obj, settings) {
        obj.data('origPos', {
            left: obj.offset().left,
            top: obj.offset().top,
            width: obj.outerWidth(),
            height: obj.outerHeight()
        });

        var data = {
            id: "#" + $(obj).attr("id"),
            class: null,
            isLive: true,
            shape: null,
            isGround: false
        }

        if (!isMouse) {
            obj.css({
                "-webkit-user-select": "none",
                "-moz-user-select": "none",
                "-ms-user-select": "none",
                "user-select": "none"
            });
        }

        var fixDef = new b2FixtureDef;
        if (obj.attr("data-density"))
            fixDef.density = parseFloat($(obj).attr("data-density"));
        else
            fixDef.density = parseFloat(settings.density);

        if ($(obj).attr("data-friction"))
            fixDef.friction = parseFloat($(obj).attr("data-friction"));
        else
            fixDef.friction = parseFloat(settings.friction);

        if ($(obj).attr("data-restitution"))
            fixDef.restitution = parseFloat($(obj).attr("data-restitution"));
        else
            fixDef.restitution = parseFloat(settings.restitution);

        // Shape data-shape

        if ($(obj).attr("data-shape")) {
            switch ($(obj).attr("data-shape")) {
                // _____ CIRCLE CREATION
                case "circle":
                    fixDef.shape = new b2CircleShape($(obj).outerWidth() / 2 / FPS);
                    data.shape = "circle";
                    break;
                // _____ TRIANGLE CREATION
                // triangles always go to use the bottom of the div as its bottom base too
                case "triangle":
                    console.log(world);
                    var left = parseFloat($(obj).attr("data-left-size")) / FPS;
                    var right = parseFloat($(obj).attr("data-right-size")) / FPS;
                    var top = parseFloat($(obj).attr("data-top-size")) / FPS;

                    var baseTop = $(obj).outerWidth() / 2 / FPS;

                    fixDef.shape = new b2PolygonShape;
                    fixDef.shape.SetAsArray([
                            new b2Vec2(left, baseTop),
                            new b2Vec2(0, top),
                            new b2Vec2(right, baseTop)], 3
                    ); //triangle shape

                    data.shape = "triangle";
                    break;
                // _____ SIMPLE POLYGON CREATION
                default:
                    fixDef = defaultBoxShape(fixDef, obj);
                    data.shape = "square";
                    break;
            }
        }
        else {
            fixDef = defaultBoxShape(fixDef, obj);
            data.shape = "square";
        }

        if ($(obj).attr("class"))
            data.class = "." + $(obj).attr("class");

        fixDef.userData = data;

        return fixDef;
    }

    function defaultBoxShape(fixDef, obj) {
        fixDef.shape = new b2PolygonShape;
        fixDef.shape.SetAsBox(
                $(obj).outerWidth() / 2 / FPS, //half width
                $(obj).outerHeight() / 2 / FPS //half height
        );
        return fixDef;
    }

    function parseBoolean(s) {
        return s === 'true';
    }

//--------------------------------------------------------------------------------------------------------------------
// Mouse interaction added to every object
    function initMouse(obj) {
        var mouse = new b2Vec2;
        window.mouse = null;
        currentMouse = null;

        $(window).mousemove(function (e) {
            e.preventDefault();
            mouse.Set(e.pageX / FPS, e.pageY / FPS);
        });

        $(obj).mousedown(function (e) {
            if (!isPaused) if (clickedFN) clickedFN($(this));

            if (currentMouse != null) {
                world.DestroyJoint(currentMouse);
                currentMouse = null;
            }

            var mouseJointDef = new b2MouseJointDef;
            mouseJointDef.target = mouse;
            mouseJointDef.bodyA = world.GetGroundBody();
            mouseJointDef.collideConnected = true;

            var body = $(this).data().content;

            if (!body) return;

            mouseJointDef.bodyB = body;
            mouseJointDef.maxForce = 3000 * body.GetMass();

            currentMouse = world.CreateJoint(mouseJointDef);
            currentMouse.SetTarget(mouse);


            function mouseup(e) {
                e.preventDefault();
                if (currentMouse != null) world.DestroyJoint(currentMouse);
                currentMouse = null;
            }

            $(window).on('mouseup', mouseup);
        });
    }

//--------------------------------------------------------------------------------------------------------------------
// this runs the visual effect in the screen
    function play() {
        console.log(jointsList[0]);
        render_loop = self.setInterval(function () {
            world.Step(
                    1 / FPS, //frame-rate
                10, //velocity iterations
                10 //position iterations
            );
            world.ClearForces();
            if (isDebug) world.DrawDebugData();

            processObjects();

            var i = bodyList.length
            while (i--) {
                var entity = bodyList[i];
                var entity = $(entity);

                var body = entity.data().content;
                var pos = body.GetPosition();
                var ang = body.GetAngle() * 180 / Math.PI;
                var origPos = entity.data('origPos');

                entity.css('transform', 'translate3d(' + (pos.x * FPS - origPos.left - origPos.width / 2) + 'px, ' + (pos.y * FPS - origPos.top - origPos.height / 2) + 'px, 0) rotate3d(0,0,1,' + ~~ang + 'deg)');
            }

            for (var i = 0; i < jointsList.length; i++) {
                var join = jointsList[i];
                if (join.userData.motorSpeed > 0) {
                    join.SetMotorSpeed(FPS / join.userData.motorSpeed);
                }
            }
            ;

        }, 1000 / FPS);
    }

//--------------------------------------------------------------------------------------------------------------------
// deleting object listener, this delete objects from jquery list and box2d bodies
    function processObjects() {
        if (itemToDelete) {

            var newArray = new Array();
            var count = 0;
            var items = bodyList.length;

            for (var i = 0; i < bodyList.length; i++) {
                var item = bodyList[i];
                if (item != itemToDelete) {
                    newArray.push(item);
                }
            }
            ;

            bodyList = newArray;

            var node = world.GetBodyList();
            while (node) {
                var b = node;
                node = node.GetNext();
                if (b.userData) {
                    if (b.userData.id == itemToDelete) {
                        b.DestroyFixture(b.GetFixtureList());
                        world.DestroyBody(b);
                        b.userData.isLive = false;
                        itemToDelete = null;
                    }
                }
            }
        }

        if (bodyList.length <= 1) {
            clearInterval(render_loop);
            //console.log ("GAME OVER");
        }
    }
}
