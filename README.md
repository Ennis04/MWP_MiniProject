# P19, UTM - Interactive 3D Campus Tour

An interactive browser-based recreation of the P19 building at Universiti Teknologi Malaysia (UTM). The project was developed for the SECV3263 Multimedia Web Programming mini project using Three.js.

## Features

- First-person exploration of P19, UTM
- Environment modelled using real-building reference photographs
- Interactive vending machines with sound and dispensing animation
- Chairs that users can sit on
- Locked-door notices
- Interactive university activity boards
- Dewan Kuliah 4, 5 and 6 signage
- Day and night lighting modes
- Collision detection for walls, doors and objects
- Responsive welcome screen and instruction interface

## Controls

| Control | Action |
|---|---|
| `W`, `A`, `S`, `D` | Move around |
| Drag mouse / touch | Look around |
| `E` | Interact with a highlighted object |
| `L` | Toggle day/night mode |
| Mouse wheel | Zoom |

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/Ennis04/MWP_MiniProject.git
   cd MWP_MiniProject
   ```

2. Install the dependencies:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

4. Open the local URL displayed in the terminal.

## Production Build

```bash
npm run build
npm run preview
```

## Technologies

- Three.js
- JavaScript
- HTML and CSS
- Vite
