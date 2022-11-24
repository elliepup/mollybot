module.exports = {
  name: 'ready',
  once: true,
  async execute(client) {
      console.log(`${client.user.tag} has logged in successfully.`)
      client.user.setPresence({ activities: [{ name: 'under maintenance', type: 0 }], status: 'dnd' });

      //initialize supabase client and connect to database
      const supabase = require('@supabase/supabase-js');
      client.supabase = supabase.createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
      console.log('Connected to Supabase database successfully.');
  }
}