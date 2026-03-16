/**
 * Shared game data for the CSK Games portal.
 *
 * Contains the complete list of browser games available on the site,
 * used by both the PC and Mobile game listing pages to avoid duplication.
 *
 * @version 1.0.0 - 2026-03-16T00:00:00Z - Initial implementation
 */

export interface Game {
  id: string;
  name: string;
  url: string;
  icon: string;
  description: string;
  tags: string[];
  platforms: ('pc' | 'mobile')[];
}

export const games: Game[] = [
  {
    id: 'hexgl',
    name: 'HexGL',
    url: 'https://computerstoreks.github.io/csk-game-HexGL/',
    icon: '\u{1F3CE}\uFE0F',
    description:
      'Futuristic 3D WebGL racing \u2014 WipeOut-style neon tracks at 60fps. Tilt to steer on mobile, keyboard on desktop. The most visually stunning game in our library.',
    tags: ['Racing', '3D', 'Single Player'],
    platforms: ['pc', 'mobile'],
  },
  {
    id: 'pacman',
    name: 'Pac-Man',
    url: 'https://computerstoreks.github.io/csk-game-pacman/',
    icon: '\u{1F47E}',
    description:
      'The arcade legend \u2014 eat all the dots, dodge the ghosts, and chomp power pellets to turn the tables. Keyboard on desktop, joystick on mobile.',
    tags: ['Arcade', 'Classic', 'Single Player'],
    platforms: ['pc', 'mobile'],
  },
  {
    id: 'bytestd',
    name: 'Bytes TD',
    url: 'https://computerstoreks.github.io/csk-game-bytestd/bytes-td.html',
    icon: '\u{1F50C}',
    description:
      'Defend the network from corrupted data packets on a randomized PCB board. Drag & drop 8 unique towers, survive endless waves of cyber threats.',
    tags: ['Tower Defense', 'Strategy', 'Single Player'],
    platforms: ['pc', 'mobile'],
  },
  {
    id: 'solitaire',
    name: 'Solitaire',
    url: 'https://computerstoreks.github.io/csk-game-solitaire/solitaire.html',
    icon: '\u{1F0CF}',
    description:
      'Classic Klondike Solitaire. Tap to move cards, stack in sequence and suit to clear the board.',
    tags: ['Card Game', 'Single Player'],
    platforms: ['pc', 'mobile'],
  },
  {
    id: 'computercrush',
    name: 'Computer Crush',
    url: 'https://computerstoreks.github.io/csk-game-computercrush/computer-crush.html',
    icon: '\u{1F5A5}\uFE0F',
    description:
      'Match CPUs, GPUs, RAM, SSDs and more in this addictive match-3 puzzler. Tap to swap, line up 3 or more computer parts to crush them!',
    tags: ['Match-3', 'Puzzle', 'Single Player'],
    platforms: ['pc', 'mobile'],
  },
  {
    id: 'rackattack',
    name: 'Rack Attack',
    url: 'https://computerstoreks.github.io/csk-game-rackattack/rack-attack.html',
    icon: '\u{1F5C4}\uFE0F',
    description:
      'Tap to keep your CPU chip airborne and dodge the endless server racks. Simple to learn, impossible to put down!',
    tags: ['Arcade', 'Single Player'],
    platforms: ['pc', 'mobile'],
  },
  {
    id: 'sudoku',
    name: 'Sudoku',
    url: 'https://computerstoreks.github.io/csk-game-sudoku/csk-sudoku.html',
    icon: '\u{1F522}',
    description:
      'Fill the 9\u00D79 grid with no repeats in any row, column, or box. Normal mode counts up, Timed mode gives you 10 minutes to finish.',
    tags: ['Puzzle', 'Single Player'],
    platforms: ['pc', 'mobile'],
  },
  {
    id: 'snake',
    name: 'Snake',
    url: 'https://computerstoreks.github.io/csk-game-snake/csk-snake.html',
    icon: '\u{1F40D}',
    description:
      'Eat the chips to grow. Don\u2019t hit the walls or yourself. Swipe to turn, speed ramps up as you grow \u2014 how long can you last?',
    tags: ['Arcade', 'Single Player'],
    platforms: ['pc', 'mobile'],
  },
  {
    id: '2048',
    name: '2048',
    url: 'https://computerstoreks.github.io/csk-game-2048/csk-2048.html',
    icon: '\u{1F522}',
    description:
      'Swipe to slide and merge numbered tiles \u2014 reach 2048 to win! Easy to learn, hard to stop playing.',
    tags: ['Puzzle', 'Single Player'],
    platforms: ['pc', 'mobile'],
  },
  {
    id: 'chipninja',
    name: 'Chip Ninja',
    url: 'https://computerstoreks.github.io/csk-game-chipninja/chip-ninja.html',
    icon: '\u2694\uFE0F',
    description:
      'Slice the old CPU sockets, spare the new ones! Swipe through obsolete chips to score combos \u2014 but don\u2019t touch the modern hardware or you\u2019ll lose a life.',
    tags: ['Action', 'Single Player'],
    platforms: ['pc', 'mobile'],
  },
  {
    id: 'tracerunner',
    name: 'Trace Runner',
    url: 'https://computerstoreks.github.io/csk-game-tracerunner/trace-runner.html',
    icon: '\u{1F50C}',
    description:
      'Guide a signal ball through a PCB circuit board maze using the joystick. Navigate copper traces across 7 levels \u2014 rated by speed. Can you route all circuits?',
    tags: ['Maze', 'Puzzle', 'Single Player'],
    platforms: ['pc', 'mobile'],
  },
];
