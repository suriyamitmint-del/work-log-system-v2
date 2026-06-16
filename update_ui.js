const fs = require('fs');
const path = require('path');

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.tsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      // Update inputs/selects/divs with rounded-md to rounded-xl
      content = content.replace(/rounded-md/g, 'rounded-xl');
      content = content.replace(/rounded-lg/g, 'rounded-xl'); // some inputs were lg
      
      // Try to find buttons and make them rounded-full
      // Match <button ... className="..." ...> and <Link ... className="..." ...> if they look like buttons
      content = content.replace(/<button([^>]*)className=(["'{])([^"'}]+)(["'}])([^>]*)>/g, (match, p1, q1, classes, q2, p2) => {
        let newClasses = classes.replace(/rounded-[a-z0-9]+/g, '').trim();
        newClasses += ' rounded-full';
        newClasses = newClasses.replace(/\s+/g, ' ');
        return `<button${p1}className=${q1}${newClasses}${q2}${p2}>`;
      });

      fs.writeFileSync(fullPath, content);
    }
  }
}

processDir('./src/app');
processDir('./src/components');
console.log('Done!');
