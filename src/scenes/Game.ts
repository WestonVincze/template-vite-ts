import { Scene } from 'phaser';
import { Behavior, Behaviors, Position, Sprite, Target, Velocity } from '../components';
import { createMovementSystem } from '../systems/MovementSystem';
import { IWorld, System, addComponent, addEntity, createWorld, hasComponent } from 'bitecs';
import createSpriteSystem from '../systems/SpriteSystem';
import { Crown, Necro } from '../components/Tags';
import { createTargetingSystem } from '../systems/TargetSystem';
import { cursorTargetSystem } from '../systems/CursorTargetSystem';

enum Textures {
    Skele,
    Guard
}
export class Game extends Scene
{
  camera: Phaser.Cameras.Scene2D.Camera;
  background: Phaser.GameObjects.Image;
  msg_text: Phaser.GameObjects.Text;

  private world!: IWorld

  // systems 
  private movementSystem!: System
  private spriteSystem!: System
  private targetingSystem!: System

  constructor ()
  {
    super('Game');
  }

  preload() {
    this.load.image('Skele', 'assets/skele.png');
    this.load.image('Guard', 'assets/guard.png');
  }

  create () {
    const createEntity = (world: IWorld) => {
      const eid = addEntity(world);
      addComponent(world, Position, eid);
      addComponent(world, Velocity, eid);
      addComponent(world, Target, eid);
      addComponent(world, Sprite, eid);
      addComponent(world, Math.random() > 0.5 ? Necro : Crown, eid);
      return eid;
    }

    this.world = createWorld();
    /*
    const mouseClick$ = fromEvent<MouseEvent>(document, 'mousedown').pipe(
      tap(() => console.log("CLICKED")),
      map((event) => ({ x: event.clientX, y: event.clientY })),
      tap(({ x, y }) => console.log(`${x} ${y}`)),
    ).subscribe();
    */
    cursorTargetSystem(this.world);

    for (let i = 0; i < 800; i++) {
      const eid = createEntity(this.world);
      Position.x[eid] = Math.random() * 1024;
      Position.y[eid] = Math.random() * 1024;
      /*
      Target.x[eid] = Math.random() * 600;
      Target.y[eid] = Math.random() * 1200;
      */
      if (hasComponent(this.world, Necro, eid)) {
        addComponent(this.world, Behavior, eid);
        Behavior.type[eid] = Behaviors.FollowCursor;
        Sprite.texture[eid] = Textures.Skele;
      } 
      if (hasComponent(this.world, Crown, eid)) Sprite.texture[eid] = Textures.Guard;
    }

    this.movementSystem = createMovementSystem();
    this.spriteSystem = createSpriteSystem(this, ['Skele', 'Guard'])
    this.targetingSystem = createTargetingSystem();

    setInterval(() => {
      this.targetingSystem(this.world);
    }, 200);
  }

  update(): void {
    this.movementSystem(this.world);
    this.spriteSystem(this.world);
  }
}
