import * as THREE from '/script/threejs/build/three.module.js';
import MovementHandler from '/script/game/handlers/movement-handler.js';
import { EffectTypeEnum } from '/script/game/3d/tile-contact-effect.js';
import { PlayerStateEnum } from '../3d/player.js';

export default class Physics {
    _physicsWorld;
    _dispatcher;
    _rigidBodies = [];
    _transformAux;
    _playerBody;

    _movementHandler;
    _gameStateManager;

    constructor(movementHandler, gameStateManager) {
        this._movementHandler = movementHandler;
        this._gameStateManager = gameStateManager;
    }

    setupPhysicsWorld() {
        const gravity = this._gameStateManager.gravity;

        let collisionConfiguration  = new Ammo.btDefaultCollisionConfiguration(),
            overlappingPairCache    = new Ammo.btDbvtBroadphase(),
            solver                  = new Ammo.btSequentialImpulseConstraintSolver();
        this._dispatcher              = new Ammo.btCollisionDispatcher(collisionConfiguration),

        this._physicsWorld           = new Ammo.btDiscreteDynamicsWorld(this._dispatcher, overlappingPairCache, solver, collisionConfiguration);
        this._physicsWorld.setGravity(new Ammo.btVector3(0, 0, gravity));
   
    }

    // updateGravity() {
    //     const velocity = this._playerBody.threeObject.userData.playerObject.getVelocity();
    //     const velocityDefault = this._playerBody.threeObject.userData.playerObject.velocityDefault;
    //     // const playerVector = this._playerBody.getLinearVelocity();
    //     // console.log('updateGravity - playerVector', playerVector);
    //     // if (velocity > velocityDefault) {
    //     //     this._physicsWorld.setGravity(this._gameStateManager.gravity * 2);
    //     // } else {
    //     //     this._physicsWorld.setGravity(this._gameStateManager.gravity);
    //     // }
    // }

    init() {
        this.reset();
        
        this.setupPhysicsWorld()
        this._transformAux = new Ammo.btTransform();
    }

    reset() {
        this._rigidBodies = [];
        this._playerBody = null;
        this._physicsWorld = null;
        this._dispatcher = null;
        this._transformAux = null;
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

        // body.setFriction(1);
        body.setRollingFriction(0.1);
        body.setRestitution(0.0);
        // body.linearDamping = 1;

        this._physicsWorld.addRigidBody(body);
        // this._physicsWorld.addCollisionObject(body);
        sphereMesh.userData.physicsBody = body;
        body.threeObject = sphereMesh;
        this._rigidBodies.push(sphereMesh);
        this._playerBody = body;
    }

    setPlayerMovement(deltaTime) {
        let velocity = this._playerBody.threeObject.userData.playerObject.getVelocity();
        let playerVector = this._playerBody.getLinearVelocity();
        let tileEffect = this._playerBody.threeObject.userData.playerObject.tileEffect;

        let moveX = this._movementHandler.moveDirection.right - this._movementHandler.moveDirection.left;
        moveX = moveX * 0.7;
        let moveY = 2;
        let moveZ = 0;

        if(moveX == 0 && moveY == 0 && moveZ == 0) return;

        if (tileEffect != null && tileEffect.effectType === EffectTypeEnum.INVERTCONTROLS) {
            moveX = -moveX;
        }

        if(moveX === 0) {
            // console.log('playerVector.x()', playerVector.x());
            // console.log('playervector', playerVector.x(), playerVector.y(), playerVector.z());  
            // moveX = playerVector.x();
        }

        let resultantImpulse = new Ammo.btVector3(moveX, moveY, moveZ);
        resultantImpulse.op_mul(velocity);
        
        if (tileEffect != null && tileEffect.effectType === EffectTypeEnum.JUMP) {
            resultantImpulse.setZ(this._gameStateManager.jumpImpulsePower); //TODO: define as constant
            // let jumpImpulse = new Ammo.btVector3(0, 0, 200);
            // this._playerBody.applyImpulse(jumpImpulse);
        } else {
            // Sometimes ball will jump when crossing to new tile - could be small gap between tiles in physics model??
            // Handle by resetting z-vector if moving up while no tileeffect on player
            let playerTileEffect = this._gameStateManager.player.tileEffect;
            let z = playerVector.z();
            if(z > 0 && (playerTileEffect !== null)) {
                z = 0;
            }
            resultantImpulse.setZ(z);
        }

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
        // let colShape = new Ammo.btBoxShape( new Ammo.btVector3(geomParams.width, 
        //                                                        geomParams.height, 
        //                                                        geomParams.depth));
        // Why do we need to divide scale by 2?
        let colShape = new Ammo.btBoxShape( new Ammo.btVector3((scale.x/2) * geomParams.width, 
                                                                (scale.y/2) * geomParams.height, 
                                                                (scale.z/2) * geomParams.depth));
        
        // let colShape = new Ammo.btBoxShape( new Ammo.btVector3((scale.x/2) * geomParams.width, 
        //                                                         (scale.z/2) * geomParams.height , 
        //                                                         (scale.y/2) * geomParams.depth));

        colShape.setMargin( 0.05 );

        let localInertia = new Ammo.btVector3(0, 0, 0);
        colShape.calculateLocalInertia( mass, localInertia );

        let rigidBodyInfo = new Ammo.btRigidBodyConstructionInfo( mass, motionState, colShape, localInertia );
        let body = new Ammo.btRigidBody( rigidBodyInfo );
        body.threeObject = tileMesh;

        body.setFriction(0.8);

        body.setRestitution(0.0);
        body.linearDamping = 1;

        this._physicsWorld.addRigidBody(body);

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
                    this.checkPlayerLocation();
                }
            }
        });

        this.detectCollision();
    }

    checkPlayerLocation() {
        const playerPosZ = this._playerBody.getWorldTransform().getOrigin().z();
        let playerPosY = this._playerBody.getWorldTransform().getOrigin().y();
        if (playerPosZ < -5) {
            
            if (this._playerBody.threeObject.userData.playerObject.playerState !== PlayerStateEnum.DROPPING) {
                this._playerBody.threeObject.userData.posAtDropY = playerPosY;
                this._gameStateManager.setPlayerDropping();
            }

            this._playerBody.getWorldTransform().getOrigin().setZ(15);
            this._playerBody.getWorldTransform().getOrigin().setX(0);

            const tileLength = this._gameStateManager.track.tileLength;
            let posY = Math.round(playerPosY - (2 * tileLength), 0);
            posY = posY < 0 ? 0 : posY;
            
            this._playerBody.getWorldTransform().getOrigin().setY(posY);
            this._gameStateManager.setPlayerDropping();

            // Update threeJs object position and update camera-pos
            this._playerBody.threeObject.position.set(this._playerBody.getWorldTransform().getOrigin().x(), posY, this._playerBody.getWorldTransform().getOrigin().z());
            this._playerBody.threeObject.userData.playerObject.updateCameraPosition();
            
        //     if (playerPosZ < -50) {
        //         // this._playerBody.getWorldTransform().getOrigin().setZ(15);
        //         this._playerBody.threeObject.userData.playerObject.handleTileContact(null);

        //         this._playerBody.getWorldTransform().getOrigin().setZ(15);
        //         this._playerBody.getWorldTransform().getOrigin().setX(0);

        //         const tileLength = this._gameStateManager.track.tileLength;
        //         // let posY = Math.round(this._playerBody.threeObject.userData.posAtDropY - (1 * tileLength), 0);
        //         let posY = Math.round(playerPosY - (1.5 * tileLength), 0);
        //         posY = posY < 0 ? 0 : posY;
        //         this._playerBody.getWorldTransform().getOrigin().setY(posY);

        //         const updatedPlayerPosZ = this._playerBody.getWorldTransform().getOrigin().z();
        //         console.log('reset - posY', posY, 'posZ', playerPosZ, 'updatedPlayerPosZ', updatedPlayerPosZ);

        //         this._playerBody.threeObject.userData.playerObject.updateCameraPosition();
        //         this._gameStateManager.setPlayerDropping();
        //         this._playerBody.threeObject.userData.posAtDropY = null;
        //     }
        } else {
            // this._playerBody.threeObject.userData.posAtDropY = null;
        }

        if(this._gameStateManager.handleIsPlayerAtEndOfTrack(playerPosY)) {

        }


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

                // let velocity0 = rigidBody0.getLinearVelocity();
                // let velocity1 = rigidBody1.getLinearVelocity();
                // let worldPos0 = contactPoint.get_m_positionWorldOnA();
                // let worldPos1 = contactPoint.get_m_positionWorldOnB();
                // let localPos0 = contactPoint.get_m_localPointA();
                // let localPos1 = contactPoint.get_m_localPointB();

                let playerObject = userData0.playerObject ? userData0.playerObject : userData1.playerObject
                let tileObject = userData0.tileObject ? userData0.tileObject : userData1.tileObject;
                if (playerObject && tileObject) {
                    collissionTiles.push({
                        'distance': distance,
                        'tile': tileObject,
                        'player': playerObject
                    });
                }
            }
        }

        if(collissionTiles.length > 0) {
            let closestItem = this.getClosestTileFromCollission(collissionTiles);
            this._playerBody.threeObject.userData.playerObject.handleTileContact(closestItem.tile);
            // console.log('setting effect', closestItem.tile.contactEffect);
        } else {
            this._playerBody.threeObject.userData.playerObject.handleTileContact(null);
        }

    }

    getClosestTileFromCollission (collissionTiles) {
        let tileItem = null;
        collissionTiles.map(item => {
            if(tileItem === null || item.distance < tileItem.distance) {
                tileItem = item;
            }
        });
        return tileItem;
    }
}