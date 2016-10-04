const THREE = SupEngine.THREE;
import P2BodyMarker from "./P2BodyMarker";

export default class P2Body extends SupEngine.ActorComponent {
  body: any;

  mass: number;
  fixedRotation: boolean;
  offsetX: number;
  offsetY: number;
  shape: string;
  debugCollider: boolean;
  width: number;
  height: number;
  angle: number;
  radius: number;

  actorPosition = new THREE.Vector3();
  actorAngles = new THREE.Euler();
  bodyRenderer: P2BodyMarker = null;

  constructor(actor: SupEngine.Actor) {
    super(actor, "P2Body");

    this.body = new (<any>window).p2.Body();
    (<any>SupEngine).P2.world.addBody(this.body);
  }

  setIsLayerActive(active: boolean) { /* Nothing to render */ }

  setup(config: any) {
    this.mass = (config.mass != null) ? config.mass : 0;
    this.fixedRotation = (config.fixedRotation != null) ? config.fixedRotation : false;
    this.offsetX = (config.offsetX != null) ? config.offsetX : 0;
    this.offsetY = (config.offsetY != null) ? config.offsetY : 0;

    this.actor.getGlobalPosition(this.actorPosition);
    this.actor.getGlobalEulerAngles(this.actorAngles);

    this.body.mass = this.mass;
    this.body.type = (this.mass === 0) ? (<any>window).p2.Body.STATIC : (<any>window).p2.Body.DYNAMIC;
    this.body.material = (<any>SupEngine).P2.world.defaultMaterial;
    this.body.fixedRotation = this.fixedRotation;
    this.body.updateMassProperties();

    this.shape = config.shape;
    switch (this.shape) {
      case "box": {
        this.width = (config.width != null) ? config.width : 0.5;
        this.height = (config.height != null) ? config.height : 0.5;
        this.angle = (config.angle != null) ? config.angle * (Math.PI / 180) : 0;
        this.body.addShape(new (<any>window).p2.Box({ width: this.width, height: this.height }));
      } break;
      case "circle": {
        this.radius = (config.radius != null) ? config.radius : 1;
        this.angle = 0;
        this.body.addShape(new (<any>window).p2.Circle({ radius: this.radius }));
      } break;
    }

    this.debugCollider = (config.debugCollider != null) ? config.debugCollider : false;
    this.body.position = [ this.actorPosition.x, this.actorPosition.y ];
    this.body.shapes[0].position = [ this.offsetX, this.offsetY ];
    this.body.angle = this.actorAngles.z + this.angle;
  }

  private setupBodyRenderer() {
    this.bodyRenderer = new P2BodyMarker(this.actor);
    if (this.shape === "box") {
      this.bodyRenderer.setBox(this.width, this.height);
    } else if (this.shape === "circle") {
      this.bodyRenderer.setCircle(this.radius);
    }
  }

  update() {
    this.actorPosition.x = this.body.position[0];
    this.actorPosition.y = this.body.position[1];
    this.actor.setGlobalPosition(this.actorPosition);

    this.actorAngles.z = this.body.angle - this.angle;
    this.actor.setGlobalEulerAngles(this.actorAngles);

    // Debug collider
    if (this.debugCollider) {
      // Lazy initialization
      if (this.bodyRenderer === null) this.setupBodyRenderer();
      this.bodyRenderer.setOffset(this.offsetX, this.offsetY);
      this.bodyRenderer.setAngle((this.angle * 180) / Math.PI);
    } else if (this.bodyRenderer) {
      this.bodyRenderer._destroy();
      this.bodyRenderer = null;
    }
  }

  _destroy() {
    (<any>SupEngine).P2.world.removeBody(this.body);
    this.body = null;
    super._destroy();
  }
}
