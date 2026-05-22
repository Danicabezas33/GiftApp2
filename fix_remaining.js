import fs from 'fs';

function replaceInFile(filePath) {
  let c = fs.readFileSync(filePath, 'utf8');
  c = c.replace(/#FFAFCC/g, '#DD2D4A');
  c = c.replace(/#FFC8DD/g, '#F49CBB');
  fs.writeFileSync(filePath, c);
}

replaceInFile('src/components/MinigameCherryBlossom.tsx');
replaceInFile('src/components/MusicPlayer.tsx');
replaceInFile('src/components/MinigameSushiStacker.tsx');
replaceInFile('src/components/MinigameSlasher.tsx');
replaceInFile('src/components/MinigameCatcher.tsx');
