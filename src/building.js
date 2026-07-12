/* =========================================================
   BUILDING LAYOUT — built from the component library. Every
   pillar/wall/door/window/roof/vending-machine/table/chair call below takes
   plain (x, y, z, rotationY, color, ...) — edit the numbers directly to
   rearrange the building. Coordinates currently reproduce the previous
   layout as a working starting point. Decorative extras (signs, benches,
   lamps, plants, downpipes, bins) are unchanged and still angle-based.

   Importing this file is what actually builds the layout (every call below
   runs immediately at import time).
   Depends on: config.js, helpers.js, components.js, decorations.js,
   environment.js (for addContactShadow)
========================================================= */
import { CFG, kioskWallH } from './config.js';
import { polar, sideAngle, vertexAngle } from './helpers.js';
import {
  createPillar, createWall, createDoor, createWindow, createRoof,
  createVendingMachine, createTable, createChair,
} from './components.js';
import {
  addSign, addArrowSign, addBench, addExtinguisherBox, addWallLamp,
  addPottedPlant, addDownpipe, addBinPair,
} from './decorations.js';
import { addContactShadow } from './environment.js';

// -- Pillars, one per corner of the octagon --
createPillar(9, 0, 0, 0, 0x7a2230);
createPillar(6.364, 0, 6.364, 0, 0x7a2230);
createPillar(0, 0, 9, 0, 0x7a2230);
createPillar(-6.364, 0, 6.364, 0, 0x7a2230);
createPillar(-9, 0, 0, 0, 0x7a2230);
createPillar(-6.364, 0, -6.364, 0, 0x7a2230);
createPillar(0, 0, -9, 0, 0x7a2230);
createPillar(6.364, 0, -6.364, 0, 0x7a2230);

// Side 0: OPEN — main entrance, camera starts here
addWallLamp(sideAngle(0));

// Side 1: kiosk, orange door, sign "4"
createWall(3.425, 0, 8.269, -2.749, 0x2d5c5c, 6.738, 2.75);
createRoof(3.425, 2.75, 8.269, -2.749, 0x1f1f1f, 6.738, 1.1, 1.6);
createDoor(3.452, 0, 8.333, -2.749, 0xc44a26);
createWindow(1.552, 1.55, 8.896, -2.969, 0xf2efe6, 0.55, 0.65);
addSign(sideAngle(1), '4', kioskWallH + 0.2);
addContactShadow(polar(sideAngle(1), CFG.R1 - 0.6, 0), 1.3, 0.8);
addDownpipe(vertexAngle(1));

// Side 2: yellow accent wall + bench + vending machines ("Area Beside")
addWallLamp(sideAngle(2));
createWall(-3.425, 0, 8.269, 2.749, 0xe8a93a, 6.738, 3.35);
createWindow(-3.456, 1.55, 8.343, 2.749, 0xf2efe6, 1.3, 1.1);
addBench(sideAngle(2), 1.9);
addPottedPlant(sideAngle(2) - 0.3, 1.5);
createVendingMachine(-2.395, 0, 7.947, 2.849, 0x2255aa);
createVendingMachine(-4.636, 0, 6.884, 2.549, 0x242220);

// Side 3: kiosk, brown door, extinguisher box, arrow sign "6" ("Left/Right - Behind")
createWall(-8.269, 0, 3.425, 1.963, 0x234848, 6.738, 2.75);
createRoof(-8.269, 2.75, 3.425, 1.963, 0x1f1f1f, 6.738, 1.1, 1.6);
createDoor(-8.333, 0, 3.452, 1.963, 0x5b3a22);
addExtinguisherBox(sideAngle(3) - 0.3);
addArrowSign(sideAngle(3) + 0.32, '6', kioskWallH + 0.25);
addBench(sideAngle(3), 2.2);
addContactShadow(polar(sideAngle(3), CFG.R1 - 0.6, 0), 1.3, 0.8);
addBinPair(sideAngle(3) + 0.55, 1.15);

// Side 4: OPEN — opposite entrance, tower glimpsed beyond ("Opposite Main Entrance")
addWallLamp(sideAngle(4));
createTable(-3.931, 0, -3.989, 0.778, 0x8a5a34);
createChair(-4.366, 0, -4.43, 0.778, 0xb3231c);
createChair(-3.496, 0, -3.547, 3.92, 0xb3231c);
createChair(-4.607, 0, -3.322, 2.349, 0xb3231c);
createChair(-3.254, 0, -4.655, -0.793, 0xb3231c);

// Side 5: teal wall with multi-pane window
createWall(-3.425, 0, -8.269, 0.393, 0x2d5c5c, 6.738, 3.35);
createWindow(-3.456, 1.55, -8.343, 0.393, 0xf2efe6, 1.3, 1.1);
addWallLamp(sideAngle(5));
addPottedPlant(sideAngle(5) + 0.85, 1.5);

// Side 6: OPEN — side pathway
addWallLamp(sideAngle(6));
addDownpipe(vertexAngle(6));
createTable(-0.041, 0, -5.6, 0.007, 0x8a5a34);
createChair(-0.045, 0, -6.22, 0.007, 0xb3231c);
createChair(-0.036, 0, -4.98, 3.149, 0xb3231c);
createChair(-0.991, 0, -5.593, 1.578, 0xb3231c);
createChair(0.909, 0, -5.607, -1.563, 0xb3231c);

// Side 7: kiosk, orange door, sign "5"
createWall(8.269, 0, -3.425, -1.178, 0x2d5c5c, 6.738, 2.75);
createRoof(8.269, 2.75, -3.425, -1.178, 0x1f1f1f, 6.738, 1.1, 1.6);
createDoor(8.333, 0, -3.452, -1.178, 0xc44a26);
createWindow(7.387, 1.55, -5.193, -0.958, 0xf2efe6, 0.55, 0.65);
addSign(sideAngle(7), '5', kioskWallH + 0.2);
addContactShadow(polar(sideAngle(7), CFG.R1 - 0.6, 0), 1.3, 0.8);
