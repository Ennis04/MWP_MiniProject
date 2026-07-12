/* =========================================================
   CONFIG — shared numeric/colour constants for the whole scene.
   No dependencies on any other file.
========================================================= */

export const CFG = {
  R1: 9,                 // pillar circumradius
  pillarRadius: 0.34,
  pillarHeight: 4.6,      // top of pillars / bottom of roof frustum
  wallHeight: 3.35,       // plain wall segments
  eaveOverhang: 0.9,      // how far the roof edge projects past the pillar ring
  roofFrustumTopY: 7.7,   // top of sloped frustum / bottom of lantern drum
  lanternDrumH: 0.85,
  roofLanternR: 3.1,
  roofCapTopY: 9.3,       // apex of small cap above the lantern
  doorW: 1.05,
  doorH: 2.25,
};

export const kioskWallH = CFG.wallHeight - 0.6;
export const RAFTER_SIZE = 0.11;     // square cross-section of the roof truss beams
export const RAFTER_INSET = 0.07;    // how far inside the roof shell the trusswork sits
export const CAPITAL_H = 0.16;
export const CAPITAL_R = CFG.pillarRadius + 0.15;

export const COLORS = {
  maroon: 0x7a2230,
  maroonDark: 0x59151f,
  teal: 0x2d5c5c,
  tealDark: 0x234848,
  roofDark: 0x242322,
  roofRib: 0xdcd8cc,
  yellow: 0xe8a93a,
  doorOrange: 0xc44a26,
  doorBrown: 0x5b3a22,
  towerTerracotta: 0xa8502f,
  white: 0xf2efe6,
  bench: 0x3a3530,
  trim: 0x18120e,
};
