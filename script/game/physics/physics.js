import * as THREE from '/script/threejs/build/three.module.js';
import MovementHandler from '/script/game/handlers/movement-handler.js';

export default class Physics {
    _physicsWorld;
    _dispatcher;
    _rigidBodies = [];
    _transformAux;
    _playerBody;

    _movementHandler;

    constructor(movementHandler) {
        this._movementHandler = movementHandler;
    }

    setupPhysicsWorld() {
        let collisionConfiguration  = new Ammo.btDefaultCollisionConfiguration(),
            overlappingPairCache    = new Ammo.btDbvtBroadphase(),
            solver                  = new Ammo.btSequentialImpulseConstraintSolver();
        this._dispatcher              = new Ammo.btCollisionDispatcher(collisionConfiguration),

        this._physicsWorld           = new Ammo.btDiscreteDynamicsWorld(this._dispatcher, overlappingPairCache, solver, collisionConfiguration);
        this._physicsWorld.setGravity(new Ammo.btVector3(0, 0, -20));
    
    }

    init() {
        this.setupPhysicsWorld()
        this._transformAux = new Ammo.btTransform();
    }

    setupPlayerSpherePhysicsBody(sphereMesh) {
        let position = new THREE.Vector3();
        sphereMesh.getWorldPosition(position);
        let quat = new THREE.Quaternion();
        sphereMesh.getWorldQuaternion(quat);
        const radius = sphereMesh.geometry.parameters.radius;
        const mass = 1;

        let transform = new Ammo.btTransform();
        transform.setIdentity();
        transform.setOrigin( new Ammo.btVector3(position.x, position.y, position.z));
        transform.setRotation( new Ammo.btQuaternion(quat.x, quat.y, quat.z, quat.w));
        let motionState = new Ammo.btDefaultMotionState(transform);

        let colShape = new Ammo.btSphereShape(radius);
        colShape.setMargin(0.05);

        let localInertia = new Ammo.btVector3(0, 0, 0);
        colShape.calculateLocalInertia(mass, localInertia);

        let rbInfo = new Ammo.btRigidBodyConstructionInfo(mass, motionState, colShape, localInertia);
        let body = new Ammo.btRigidBody(rbInfo);

        // body.setFriction(4);
        // body.setRollingFriction(10);

        this._physicsWorld.addRigidBody(body);
        sphereMesh.userData.physicsBody = body;
        body.threeObject = sphereMesh;
        this._rigidBodies.push(sphereMesh);
        this._playerBody = body;

        // this._physicsWorld.addCollisionObject(body);
    }

    // setPlayerVelocity(velocity) {
    //     var velocityVector = new Ammo.btVector3();
    //     velocityVector.setValue(0, velocity, 0)
    //     this._playerBody.setLinearVelocity(velocityVector);
    // }

    setPlayerMovement(deltaTime) {
        let velocity = 30;
        // let velocityTime = velocity * deltaTime;

        let cv = this._playerBody.getLinearVelocity();

        let moveX = this._movementHandler.moveDirection.right - this._movementHandler.moveDirection.left;
        let moveY = 2;
        let moveZ = 0;

        if(moveX == 0 && moveY == 0 && moveZ == 0) return;

        let resultantImpulse = new Ammo.btVector3(moveX, moveY, moveZ);
        resultantImpulse.op_mul(velocity);
        
        resultantImpulse.setZ(cv.z());

        this._playerBody.setLinearVelocity(resultantImpulse);
        // this._playerBody.applyImpulse(resultantImpulse);
        // this._playerBody.applyForce(resultantImpulse);
        
    }

    createTilePhysicsBody(tileMesh) {
        let position = new THREE.Vector3();
        tileMesh.getWorldPosition(position);
        let scale = tileMesh.scale;
        let quat = new THREE.Quaternion();
        tileMesh.getWorldQuaternion(quat);
        let mass = 0;

        let transform = new Ammo.btTransform();
        transform.setIdentity();
        transform.setOrigin( new Ammo.btVector3( position.x, position.y, position.z ) );
        transform.setRotation( new Ammo.btQuaternion( quat.x, quat.y, quat.z, quat.w ) );
        let motionState = new Ammo.btDefaultMotionState( transform );

        // TODO: Note - height and depth are switched around
        let geomParams = tileMesh.geometry.parameters;
        let colShape = new Ammo.btBoxShape( new Ammo.btVector3(scale.x * geomParams.width, 
                                                               scale.y * geomParams.height, 
                                                               scale.z * geomParams.depth));
        colShape.setMargin( 0.05 );

        let localInertia = new Ammo.btVector3( 0, 0, 0 );
        colShape.calculateLocalInertia( mass, localInertia );

        let rigidBodyInfo = new Ammo.btRigidBodyConstructionInfo( mass, motionState, colShape, localInertia );
        let body = new Ammo.btRigidBody( rigidBodyInfo );
        body.threeObject = tileMesh;

        // body.setFriction(4);
        // body.setRollingFriction(10);

        this._physicsWorld.addRigidBody( body );
    }

    updatePhysics(deltaTime){
        // Step world
        this._physicsWorld.stepSimulation(deltaTime, 10);

        // Update rigid bodies
        this._rigidBodies.map(objThree => {
            let objAmmo = objThree.userData.physicsBody;
            let motionState = objAmmo.getMotionState();
            if (motionState) {
                motionState.getWorldTransform(this._transformAux);
                let position = this._transformAux.getOrigin();
                let quat = this._transformAux.getRotation();
                objThree.position.set(position.x(), position.y(), position.z());
                objThree.quaternion.set(quat.x(), quat.y(), quat.z(), quat.w());

                if(objThree.userData.isPlayer) {
                    this.setPlayerMovement(deltaTime);
                }

            }
        });

        this.detectCollision();
        
    }

    detectCollision() {
        let numManifolds = this._dispatcher.getNumManifolds();
        const collissionTiles = [];

        for (let i = 0; i < numManifolds; i++) {

            let contactManifold = this._dispatcher.getManifoldByIndexInternal(i);

            let rigidBody0 = Ammo.castObject(contactManifold.getBody0(), Ammo.btRigidBody);
            let rigidBody1 = Ammo.castObject(contactManifold.getBody1(), Ammo.btRigidBody);
            let threeObject0 = rigidBody0.threeObject;
            let threeObject1 = rigidBody1.threeObject;
            
            if (!threeObject0 && !threeObject1) continue;

            let userData0 = threeObject0 ? threeObject0.userData : null;
            let userData1 = threeObject1 ? threeObject1.userData : null;
            // let tag0 = userData0 ? userData0.isPlayer : "not player";
            // let tag1 = userData1 ? userData1.isPlayer : "not player";

            let numContacts = contactManifold.getNumContacts();

            for (let j = 0; j < numContacts; j++) {

                let contactPoint = contactManifold.getContactPoint(j);
                let distance = contactPoint.getDistance();

                if(distance > 0.0) continue;

                let velocity0 = rigidBody0.getLinearVelocity();
                let velocity1 = rigidBody1.getLinearVelocity();
                let worldPos0 = contactPoint.get_m_positionWorldOnA();
                let worldPos1 = contactPoint.get_m_positionWorldOnB();
                let localPos0 = contactPoint.get_m_localPointA();
                let localPos1 = contactPoint.get_m_localPointB();

                let playerObject = userData0.playerObject ? userData0.playerObject : userData1.playerObject
                let tileObject = userData0.tileObject ? userData0.tileObject : userData1.tileObject;
                if (playerObject && tileObject) {
                    collissionTiles.push({
                        'distance': distance,
                        'tile': tileObject,
                        'player': playerObject
                    });
                }

                
                // console.log({
                //     manifoldIndex: i, 
                //     contactIndex: j, 
                //     distance: distance, 
                //     object0:{
                //         tag: tag0,
                //         velocity: {x: velocity0.x(), y: velocity0.y(), z: velocity0.z()},
                //         worldPos: {x: worldPos0.x(), y: worldPos0.y(), z: worldPos0.z()},
                //         localPos: {x: localPos0.x(), y: localPos0.y(), z: localPos0.z()}
                //     },
                //     object1:{
                //         tag: tag1,
                //         velocity: {x: velocity1.x(), y: velocity1.y(), z: velocity1.z()},
                //         worldPos: {x: worldPos1.x(), y: worldPos1.y(), z: worldPos1.z()},
                //         localPos: {x: localPos1.x(), y: localPos1.y(), z: localPos1.z()}
                //     }
                // });

                // debugger;

            }
        }

        if(collissionTiles.length > 0) {
            let closestItem = this.getClosestObject(collissionTiles);
            closestItem.player.handleTileContact(closestItem.tile);
        }

    }

    getClosestObject(collissionTiles) {
        let tileItem = null;
        collissionTiles.map(item => {
            if(tileItem === null || item.distance < tileItem.distance) {
                tileItem = item;
            }
        });
        return tileItem;
        // return collissionTiles.reduce((min, p) => p.distance < min ? p.distance : min, collissionTiles[0].y);
    }
}