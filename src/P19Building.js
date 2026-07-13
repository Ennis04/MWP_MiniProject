import { buildCeramicFloor } from './floor.js';
import { buildBrickCenter } from './brickCenter.js';
import { buildWalls } from './walls.js';
import { buildRedPillars } from './pillars.js';
import { buildCeiling } from './ceiling.js';
import { buildBackWall } from './backWall.js';
import { buildDoor } from './door.js';
import { buildCenterRoom } from './centerRoom.js';
import { buildSquareRoom } from './squareRoom.js';
import { buildFillerWalls } from './filler.js';
import { buildVendingMachine } from './vendingMachine.js';
import { buildStudyDesk } from './studyDesk.js';
import { buildInformationBoard } from './informationBoard.js';
import { buildLectureHallSignage } from './signage.js';

export function buildP19Building(scene) {
  // Base Structure
  buildCeramicFloor(scene, 30);
  buildBrickCenter(scene, 10);
  buildWalls(scene, 30);
  buildRedPillars(scene);
  buildCeiling(scene, 30);
  buildBackWall(scene);
  
  // Doors
  buildDoor(scene, -15, 0, 0);
  buildDoor(scene, -15, -10, 0);
  buildDoor(scene, 15, 0, Math.PI);
  buildDoor(scene, 15, -10, Math.PI);
  buildDoor(scene, 4.8, 15, Math.PI / 2);
  buildDoor(scene, -4.8, 15, Math.PI / 2);
  
  // Center Room & Fillers
  buildCenterRoom(scene, 0, 12, Math.PI / 2);
  buildFillerWalls(scene);

  // Square Rooms
  buildSquareRoom(scene, -14.5, 3.8, Math.PI / 2);
  buildSquareRoom(scene, 14.5, 3.8, -Math.PI / 2);

  // Vending Machines (you can add as many as you want by just changing the coordinates!)
  buildVendingMachine(scene, 13, 14, Math.PI); 
  buildVendingMachine(scene, 14, 12, -Math.PI / 2);

  // Study Desks (lined up near the front/back)
  buildStudyDesk(scene, -13, -5, -Math.PI / 2); 
  buildStudyDesk(scene, -13, -5, Math.PI / 2); 
  buildStudyDesk(scene, 13, -5, -Math.PI / 2); 
  buildStudyDesk(scene, 13, -5, Math.PI / 2);
  buildInformationBoard(scene, -14.72, 2.05, -5, Math.PI / 2);
  buildInformationBoard(scene, 14.72, 2.05, -5, -Math.PI / 2);
  buildLectureHallSignage(scene);

  buildVendingMachine(scene, -13, 14, Math.PI); 
  buildVendingMachine(scene, -14, 12, Math.PI / 2);
}
