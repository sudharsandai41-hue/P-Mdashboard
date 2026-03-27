const fs = require('fs');
const dbPath = './src/lib/db.json';
const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

db.tasks = db.tasks.map(task => {
  return {
    ...task,
    score: null,
    status: "Pending",
    feedback: "",
    updatedAt: ""
  };
});

fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf8');
console.log("Scores and task statuses reset successfully!");
