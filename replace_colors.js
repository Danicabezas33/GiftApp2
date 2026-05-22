import fs from 'fs';
import path from 'path';

const directory = 'src/components';
const files = fs.readdirSync(directory).filter(f => f.endsWith('.tsx'));

const replacements = [
  { p: /text-\[#4A3B52\]/g, r: "text-[#880D1E]" },
  { p: /text-\[#4A3B52\]\/80/g, r: "text-slate-700" },
  { p: /text-\[#4A3B52\]\/60/g, r: "text-slate-500" },
  { p: /bg-\[#FFAFCC\]/g, r: "bg-[#DD2D4A]" },
  { p: /hover:bg-\[#FFAFCC\]/g, r: "hover:bg-[#F26A8D]" },
  { p: /hover:bg-\[#FFC8DD\]/g, r: "hover:bg-[#F26A8D]" },
  { p: /text-\[#FFAFCC\]/g, r: "text-[#DD2D4A]" },
  { p: /text-\[#CDB4DB\]/g, r: "text-[#880D1E]/70" },
  { p: /shadow-\[#FFC8DD\]/g, r: "shadow-[#F49CBB]" },
  { p: /border-\[#FFC8DD\]/g, r: "border-[#F49CBB]" },
  { p: /border-\[#FFAFCC\]/g, r: "border-[#DD2D4A]" },
  { p: /bg-\[#FFC8DD\]/g, r: "bg-[#F49CBB]" },
  { p: /bg-\[#FFF0F5\]/g, r: "bg-[#F49CBB]/20" },
  { p: /shadow-\[#FFAFCC\]/g, r: "shadow-[#DD2D4A]" },
  { p: /fill-\[#FFC8DD\]/g, r: "fill-[#F49CBB]" },
  { p: /text-\[#A2D2FF\]/g, r: "text-[#CBEEF3]" },
  { p: /from-\[#FFAFCC\]/g, r: "from-[#DD2D4A]" },
  { p: /from-\[#FFC8DD\]/g, r: "from-[#F49CBB]" },
  { p: /from-\[#F0F8FF\]/g, r: "from-[#CBEEF3]/20" },
  { p: /to-\[#BDE0FE\]/g, r: "to-[#F49CBB]/20" },
  { p: /to-\[#4A3B52\]/g, r: "to-[#880D1E]" },
  { p: /to-\[#FFC8DD\]/g, r: "to-[#F49CBB]" },
];

files.forEach(file => {
  const filePath = path.join(directory, file);
  let content = fs.readFileSync(filePath, 'utf8');
  replacements.forEach(({p, r}) => {
    content = content.replace(p, r);
  });
  content = content.replace(/rgba\(255,139,167,/g, "rgba(221,45,74,");
  fs.writeFileSync(filePath, content, 'utf8');
});

let appContent = fs.readFileSync('src/App.tsx', 'utf8');
replacements.forEach(({p, r}) => {
  appContent = appContent.replace(p, r);
});
fs.writeFileSync('src/App.tsx', appContent, 'utf8');
