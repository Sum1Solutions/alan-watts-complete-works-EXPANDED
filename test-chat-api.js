#!/usr/bin/env node

/**
 * Test script for the chat API functionality
 */

async function testChatAPI() {
  console.log('🧪 Testing Chat API...\n');

  // Test data
  const testMessage = {
    message: "Hello, can you tell me about Alan Watts?",
    history: [],
    currentSection: "books",
    contextUpdates: []
  };

  console.log('📤 Sending request to local dev server...');
  console.log('Request data:', JSON.stringify(testMessage, null, 2));
  
  try {
    const response = await fetch('http://localhost:5173/api/watts-chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testMessage)
    });

    console.log('\n📊 Response Status:', response.status);
    console.log('Response Headers:', Object.fromEntries(response.headers));

    if (!response.ok) {
      const errorText = await response.text();
      console.log('❌ Error Response:', errorText);
      return;
    }

    const data = await response.json();
    console.log('\n✅ Success! Response:', JSON.stringify(data, null, 2));
    
  } catch (error) {
    console.log('❌ Network Error:', error.message);
  }
}

// Test the production API as well
async function testProductionAPI() {
  console.log('\n🌐 Testing Production API...\n');

  const testMessage = {
    message: "Hello, test message",
    history: [],
    currentSection: "books",
    contextUpdates: []
  };

  try {
    const response = await fetch('https://master.alan-watts-complete-works.pages.dev/api/watts-chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testMessage)
    });

    console.log('📊 Production Response Status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log('❌ Production Error:', errorText);
      return;
    }

    const data = await response.json();
    console.log('✅ Production Success! Response length:', data.response?.length || 0, 'characters');
    console.log('Response preview:', data.response?.substring(0, 100) + '...');
    
  } catch (error) {
    console.log('❌ Production Network Error:', error.message);
  }
}

// Run tests
async function runTests() {
  await testChatAPI();
  await testProductionAPI();
}

runTests();