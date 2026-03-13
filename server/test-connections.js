const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const { testConnection, pool } = require('./config/database');
const aiService = require('./services/aiService');

async function verifyConnections() {
  console.log('--- Verification Started ---');
  console.log('Environment variables check:');
  console.log(`PGHOST: "${process.env.PGHOST}"`);
  console.log(`PGUSER: "${process.env.PGUSER}"`);
  console.log(`PGDATABASE: "${process.env.PGDATABASE}"`);
  console.log(`AZURE_OPENAI_ENDPOINT: "${process.env.AZURE_OPENAI_ENDPOINT}"`);
  console.log(`AZURE_OPENAI_DEPLOYMENT: "${process.env.AZURE_OPENAI_DEPLOYMENT}"`);
  
  // 1. Test DB Connection
  console.log('\n1. Testing Azure PostgreSQL Connection...');
  try {
    const dbConnected = await testConnection();
    if (dbConnected) {
      const result = await pool.query('SELECT count(*) FROM users');
      console.log(`✅ DB Connected. User count: ${result.rows[0].count}`);
      
      const commodities = await pool.query('SELECT count(*) FROM commodities');
      console.log(`✅ Commodity count: ${commodities.rows[0].count}`);
    } else {
      console.error('❌ DB Connection failed.');
    }
  } catch (error) {
    console.error(`❌ DB Error: ${error.message}`);
  }

  // 2. Test AI Connection
  console.log('\n2. Testing Azure OpenAI Connection...');
  const deploymentsToTry = [process.env.AZURE_OPENAI_DEPLOYMENT, 'AFRO-AI', 'gpt-4o-mini'];
  let aiSuccess = false;

  for (const deployment of deploymentsToTry) {
    if (!deployment) continue;
    console.log(`Trying deployment: ${deployment}...`);
    try {
      // Temporarily override deployment name for testing
      const originalDeployment = aiService.deploymentName;
      aiService.deploymentName = deployment;
      
      const aiResponse = await aiService.generateChatCompletion([
        { role: 'user', content: 'Hello, confirm operational status.' }
      ], { maxTokens: 10 });
      
      if (aiResponse && aiResponse.choices) {
        console.log(`✅ AI Connected with deployment: ${deployment}`);
        console.log(`AI Response: ${aiResponse.choices[0].message.content}`);
        aiSuccess = true;
        aiService.deploymentName = originalDeployment; // Restore or keep if we want to update .env later
        break;
      }
      aiService.deploymentName = originalDeployment;
    } catch (error) {
      console.log(`❌ Deployment ${deployment} failed: ${error.message}`);
    }
  }

  if (!aiSuccess) {
    console.error('❌ All AI deployment attempts failed.');
  }

  console.log('\n--- Verification Finished ---');
  process.exit(0);
}

verifyConnections();
