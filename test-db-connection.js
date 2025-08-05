const { Client } = require('pg');

async function testConnection() {
  // Try different connection configurations
  const configs = [
    {
      name: 'localhost:5432',
      connectionString: 'postgresql://postgres:admin@localhost:5432/onlytwins_db'
    },
    {
      name: 'host.docker.internal:5432',
      connectionString: 'postgresql://postgres:admin@host.docker.internal:5432/onlytwins_db'
    },
    {
      name: '127.0.0.1:5432',
      connectionString: 'postgresql://postgres:admin@127.0.0.1:5432/onlytwins_db'
    }
  ];

  for (const config of configs) {
    console.log(`\nTrying ${config.name}...`);
    const client = new Client({
      connectionString: config.connectionString
    });

    try {
      await client.connect();
      console.log(`✅ SUCCESS: Connected to ${config.name}`);
      console.log(`Use this DATABASE_URL: ${config.connectionString}`);
      
      // Test query
      const result = await client.query('SELECT current_database()');
      console.log(`Connected to database: ${result.rows[0].current_database}`);
      
      await client.end();
      return config.connectionString;
    } catch (error) {
      console.log(`❌ Failed: ${error.message}`);
    }
  }
}

testConnection().then(url => {
  if (url) {
    console.log('\n📝 Update your .env.local with:');
    console.log(`DATABASE_URL="${url}"`);
  } else {
    console.log('\n❌ Could not connect to PostgreSQL');
    console.log('Make sure PostgreSQL is running on Windows');
  }
});