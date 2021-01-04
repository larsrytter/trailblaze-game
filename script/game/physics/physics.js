import * as THREE from '/script/threejs/build/three.module.js';
import MovementHandler from '/script/game/handlers/movement-handler.js';

export default class Physics {
    _physicsWorld;
    _rigidBodies = [];
    _tmpTransform;
    _playerBody;

    _movementHandler;

    constructor(movementHandler) {
        this._movementHandler = movementHandler;
    }

    setupPhysicsWorld() {
        let collisionConfiguration  = new Ammo.btDefaultCollisionConfiguration(),
            dispatcher              = new Ammo.btCollisionDispatcher(collisionConfiguration),
            overlappingPairCache    = new Ammo.btDbvtBroadphase(),
            solver                  = new Ammo.btSequentialImpulseConstraintSolver();

        this._physicsWorld           = new Ammo.btDiscreteDynamicsWorld(dispatcher, overlappingPairCache, solver, collisionConfiguration);
        this._physicsWorld.setGravity(new Ammo.btVector3(0, 0, -10));
    
    }

    init() {
        this.setupPhysicsWorld()
        this._tmpTransform = new Ammo.btTransform();
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

        body.setFriction(4);
        body.setRollingFriction(10);

        this._physicsWorld.addRigidBody(body);
        sphereMesh.userData.physicsBody = body;
        this._rigidBodies.push(sphereMesh);
        this._playerBody = body;
    }

    setPlayerVelocity(velocity) {
        var velocityVector = new Ammo.btVector3();
        velocityVector.setValue(0, velocity, 0)
        this._playerBody.setLinearVelocity(velocityVector);
    }

    setPlayerMovement() {
        let velocity = 20;

        let moveX = this._movementHandler.moveDirection.right - this._movementHandler.moveDirection.left;
        let moveY = 1;
        let moveZ = 0;

        if(moveX == 0 && moveY == 0 && moveZ == 0) return;

        let resultantImpulse = new Ammo.btVector3(moveX, moveY, moveZ);
        resultantImpulse.op_mul(velocity);

        // let physicsBody = ballObject.userData.physicsBody;
        // physicsBody.setLinearVelocity(resultantImpulse);

        this._playerBody.setLinearVelocity(resultantImpulse);

        // let scalingFactor = 20;

        // let moveX =  moveDirection.right - moveDirection.left;
        // let moveZ =  moveDirection.back - moveDirection.forward;
        // let moveY =  0; 

        // if( moveX == 0 && moveY == 0 && moveZ == 0) return;

        // let resultantImpulse = new Ammo.btVector3( moveX, moveY, moveZ )
        // resultantImpulse.op_mul(scalingFactor);

        // let physicsBody = ballObject.userData.physicsBody;
        // physicsBody.setLinearVelocity( resultantImpulse );
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

        body.setFriction(4);
        body.setRollingFriction(10);

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
                motionState.getWorldTransform(this._tmpTransform);
                let position = this._tmpTransform.getOrigin();
                let quat = this._tmpTransform.getRotation();
                objThree.position.set(position.x(), position.y(), position.z());
                objThree.quaternion.set(quat.x(), quat.y(), quat.z(), quat.w());
            }
        });
    }
}