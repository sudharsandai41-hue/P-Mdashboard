const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabase = createClient(
  'https://ncmhgyblpkyijaypcxvk.supabase.co',
  'sb_publishable_GMlJf4TNPowF3XKYOcPtYw_i11cLK-k'
);

async function run() {
  const dbFile = path.join(__dirname, '..', 'src', 'lib', 'db.json');
  const data = JSON.parse(fs.readFileSync(dbFile, 'utf8'));

  console.log('Uploading ' + data.teams.length + ' teams...');
  for(let t of data.teams) {
    const id = t.id || t.name.toLowerCase().replace(/\s+/g, '-');
    const { error } = await supabase.from('teams').upsert({ id, name: t.name, members: t.members });
    if(error) console.error(error.message);
  }

  console.log('Uploading ' + data.tasks.length + ' tasks...');
  
  // Batch insert 10 at a time
  for (let i = 0; i < data.tasks.length; i += 10) {
      const batch = data.tasks.slice(i, i + 10).map(t => {
        // Fix empty strings to null for postgres timestamp mapping
        let validDate = null;
        if (t.updatedAt && t.updatedAt !== "") {
           validDate = new Date(t.updatedAt).toISOString();
        }

        return {
          id: t.id,
          title: t.title,
          assignedTo: t.assignedTo,
          team: t.team,
          status: t.status,
          score: t.score === null || t.score === "" ? null : parseInt(t.score, 10),
          feedback: t.feedback || null,
          driveLink: t.driveLink || null,
          updatedAt: validDate
        };
      });
      const { error } = await supabase.from('tasks').upsert(batch);
      if(error) console.error('Batch error:', error.message);
  }

  console.log('SUCCESS: All data mapped from local db.json -> Supabase Cloud!');
}
run();
