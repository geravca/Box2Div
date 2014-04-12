//### In your import file, use the following imports:
//<script type="text/javascript" src="$/$.js"></script>
//<script type="text/javascript" src="Box2D/Box2D.js"></script>
//<script type="text/javascript" src="Box2D/Box2Div.js"></script>
//<script type="text/javascript" src="Box2D/$.ui.touch.js"></script>

function Box2Div(options) {
    "use strict";
    // IMPORT EVERTHING
    var b2Vec2 = Box2D.Common.Math.b2Vec2,
        b2BodyDef = Box2D.Dynamics.b2BodyDef,
        b2Body = Box2D.Dynamics.b2Body,
        b2FixtureDef = Box2D.Dynamics.b2FixtureDef,
        b2Fixture = Box2D.Dynamics.b2Fixture,
        b2World = Box2D.Dynamics.b2World,
        b2MassData = Box2D.Collision.Shapes.b2MassData,
        b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape,
        b2CircleShape = Box2D.Collision.Shapes.b2CircleShape,
        b2DebugDraw = Box2D.Dynamics.b2DebugDraw,
        b2MouseJointDef = Box2D.Dynamics.Joints.b2MouseJointDef,
        b2MouseJoint = Box2D.Dynamics.Joints.b2MouseJoint,
        b2RevoluteJointDef = Box2D.Dynamics.Joints.b2RevoluteJointDef,
        b2RevoluteJoint = Box2D.Dynamics.Joints.b2RevoluteJoint,

        render_loop = null,

        world = null,
        bodyList = [],
        jointsList = [],
        FPS = 60, 	// hack (not change [usual fps])
        itemToDelete = null,
        playFN = null,
        pauseFN = null,
        clickedFN = null,
        contactFN = null,
        objA = null,
        objB = null,
        currentMouse = null,
        isPaused = false,

        settings = {},
        defaults = {
            debug: false,
            density: 1.5,
            friction: 0.3,
            restitution: 0.3,
            gravityX: 0,
            gravityY: 0,
            isMouse: false,
            container: 'body',
            ground: {
                top: null,
                right: null,
                bottom: null,
                left: null
            },
            shapes: null
        };

    if (typeof options == 'object') {
        settings = $.extend(defaults, options);
        world = new b2World(new b2Vec2(settings.gravityX, settings.gravityY), true);
        //---------
        if (settings.debug) {
            var debugDraw = new b2DebugDraw(),
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
        }

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

        console.log(listener);
        world.SetContactListener(listener);
        initMouse();

        $(settings.shapes).each(function (i, el) {
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

        ground(settings.ground.top);
        ground(settings.ground.right);
        ground(settings.ground.bottom);
        ground(settings.ground.left);

    } else {
        settings = defaults;
    }

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
        };

        if (!settings.isMouse) {
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

    function initMouse(obj) {
        var mouse = new b2Vec2;
        window.mouse = null;
        currentMouse = null;

        $(window).mousemove(function (event) {
            event.preventDefault();
            mouse.Set(event.pageX / FPS, event.pageY / FPS);
        });

        $(obj).mousedown(function (event) {
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


            function mouseup(event) {
                event.preventDefault();
                if (currentMouse != null) world.DestroyJoint(currentMouse);
                currentMouse = null;
            }

            $(window).on('mouseup', mouseup);
        });
    }

    function play() {
        render_loop = self.setInterval(function () {
            world.Step(
                    1 / FPS, //frame-rate
                10, //velocity iterations
                10 //position iterations
            );
            world.ClearForces();
            if (settings.debug) world.DrawDebugData();

            processObjects();

            var length = bodyList.length;
            while (length--) {
                var entity = $(bodyList[length]);

                var body = entity.data().content;
                var pos = body.GetPosition();
                var ang = body.GetAngle() * 180 / Math.PI;
                var origPos = entity.data('origPos');

                entity.css('transform', 'translate3d(' + (pos.x * FPS - origPos.left - origPos.width / 2) + 'px, ' + (pos.y * FPS - origPos.top - origPos.height / 2) + 'px, 0) rotate3d(0,0,1,' + ~~ang + 'deg)');
            }
            var i = 0;
            for (i; i < jointsList.length; i++) {
                var join = jointsList[i];
                if (join.userData.motorSpeed > 0) {
                    join.SetMotorSpeed(FPS / join.userData.motorSpeed);
                }
            }

        }, 1000 / FPS);
    }

    function processObjects() {
        if (itemToDelete) {
            var newArray = [];
            var i = 0,
                items = bodyList.length;

            for (i; i < items; i++) {
                var item = bodyList[i];
                if (item != itemToDelete) {
                    newArray.push(item);
                }
            }

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
        }
    }

    /*******************************************************************************************************************
     * PUBLIC METHODS
     *******************************************************************************************************************/
    return {
        play: function () {
            if (currentMouse != null) world.DestroyJoint(currentMouse);
            if (playFN) playFN();
            if (isPaused) isPaused = false;
            play();
        },
        onPlay: function (func) {
            playFN = func;
        },
        pause: function () {
            isPaused = true;
            clearInterval(render_loop);
            if (pauseFN) pauseFN();
        },
        onPause: function (func) {
            pauseFN = func;
        },
        onClickElement: function (fn) {
            clickedFN = fn;
        },
        onContact: function (callback) {
            contactFN = callback;
        },
        impulseObject: function (bodyID, from, to) {
            $(bodyID).data().content.ApplyImpulse(new b2Vec2(to.x, to.y), new b2Vec2(from.x, from.y));
        },
        addElement: function (id) {
            if (id) {
                bodyList.push(id);
                createDivElement($(id), {
                    density: settings.density,
                    friction: settings.friction,
                    restitution: settings.restitution
                });
            }
        },
        destroyElement: function (id) {
            itemToDelete = id;
        },
        distanceLink: function (bodyID1, bodyID2, settings) {
            var bodyA = $(bodyID1).data().content,
                bodyB = $(bodyID2).data().content,
                jointDef = new b2RevoluteJointDef();

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
            var newJoint = world.CreateJoint(jointDef);
            if (settings) {
                newJoint.userData = settings;
                jointsList.push(newJoint);
            }
        }
    }
}
