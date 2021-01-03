
export default class Physics {
    _physicsWorld;
    _rigidBodies = [];
    _tmpTransform;
    _playerBody;

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
        const position = sphereMesh.position;
        const quat = sphereMesh.quaternion;
        const radius = sphereMesh.geometry.parameters.radius;
        const mass = 1;

        console.log('radius', radius);

        let transform = new Ammo.btTransform();
        transform.setIdentity();
        transform.setOrigin( new Ammo.btVector3( position.x, position.y, position.z ) );
        transform.setRotation( new Ammo.btQuaternion( quat.x, quat.y, quat.z, quat.w ) );
        let motionState = new Ammo.btDefaultMotionState( transform );

        let colShape = new Ammo.btSphereShape( radius );
        colShape.setMargin( 0.05 );

        let localInertia = new Ammo.btVector3( 0, 0, 0 );
        colShape.calculateLocalInertia(mass, localInertia);

        let rbInfo = new Ammo.btRigidBodyConstructionInfo(mass, motionState, colShape, localInertia);
        let body = new Ammo.btRigidBody( rbInfo );

        body.setFriction(4);
        body.setRollingFriction(10);

        this._physicsWorld.addRigidBody( body );

        sphereMesh.userData.physicsBody = body;
        this._rigidBodies.push(sphereMesh);

        this._playerBody = body;
    }

    setPlayerVelocity(velocity) {
        var velocityVector = new Ammo.btVector3();
        velocityVector.setValue(0, velocity, 0)
        this._playerBody.setLinearVelocity(velocityVector);
    }

    createTilePhysicsBody(tileMesh) {
        // let pos = {x: 0, y: 0, z: 0};
        let pos = tileMesh.position;
        // let scale = {x: 50, y: 2, z: 50};
        let scale = tileMesh.scale;
        // let quat = {x: 0, y: 0, z: 0, w: 1};
        let quat = tileMesh.quaternion;
        let mass = 0;

        let transform = new Ammo.btTransform();
        transform.setIdentity();
        transform.setOrigin( new Ammo.btVector3( pos.x, pos.y, pos.z ) );
        transform.setRotation( new Ammo.btQuaternion( quat.x, quat.y, quat.z, quat.w ) );
        let motionState = new Ammo.btDefaultMotionState( transform );

        let colShape = new Ammo.btBoxShape( new Ammo.btVector3( scale.x * 0.5, scale.y * 0.5, scale.z * 0.5 ) );
        colShape.setMargin( 0.05 );

        let localInertia = new Ammo.btVector3( 0, 0, 0 );
        colShape.calculateLocalInertia( mass, localInertia );

        let rigidBodyInfo = new Ammo.btRigidBodyConstructionInfo( mass, motionState, colShape, localInertia );
        let body = new Ammo.btRigidBody( rigidBodyInfo );


        this._physicsWorld.addRigidBody( body );
    }

    updatePhysics(deltaTime){
        // Step world
        this._physicsWorld.stepSimulation(deltaTime, 10);

        // console.log(this._physicsWorld);
        // const tmpGravity = this._physicsWorld.getGravity();
        // console.log('gravity', tmpGravity.x(), tmpGravity.y(), tmpGravity.z());

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