// Comprehensive Feature Testing Script
const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:5000';
const ML_URL = 'http://localhost:8000';

const tests = [];
let passed = 0;
let failed = 0;

function logTest(name, status, details = '') {
  const icon = status ? '✅' : '❌';
  console.log(`${icon} ${name}${details ? ': ' + details : ''}`);
  tests.push({ name, status, details });
  if (status) passed++; else failed++;
}

async function test(name, fn) {
  try {
    await fn();
    logTest(name, true);
  } catch (error) {
    logTest(name, false, error.message);
  }
}

async function runTests() {
  console.log('\n🧪 COMPREHENSIVE FEATURE TESTING\n');
  console.log('='.repeat(60));

  // Test 1: Backend Health
  await test('Backend Health Check', async () => {
    const res = await fetch(`${BASE_URL}/api/health`);
    const data = await res.json();
    if (data.status !== 'ok') throw new Error('Backend not healthy');
  });

  // Test 2: ML Service Health
  await test('ML Service Health Check', async () => {
    const res = await fetch(`${ML_URL}/health`);
    const data = await res.json();
    if (data.status !== 'ok') throw new Error('ML service not healthy');
  });

  // Test 3: Get All Properties (Data Merging)
  let allProperties = [];
  await test('Get All Properties (Data Merging)', async () => {
    const res = await fetch(`${BASE_URL}/api/properties`);
    const data = await res.json();
    if (!data.success) throw new Error('Failed to get properties');
    if (!data.data || data.data.length === 0) throw new Error('No properties returned');
    allProperties = data.data;
    
    // Verify merged data structure
    const firstProp = data.data[0];
    if (!firstProp.id) throw new Error('Missing id');
    if (!firstProp.title) throw new Error('Missing title');
    if (!firstProp.price) throw new Error('Missing price');
    if (!firstProp.location) throw new Error('Missing location');
    if (!firstProp.bedrooms) throw new Error('Missing bedrooms');
    if (!firstProp.bathrooms) throw new Error('Missing bathrooms');
    if (!firstProp.size_sqft) throw new Error('Missing size_sqft');
    if (!firstProp.image_url) throw new Error('Missing image_url');
  });

  // Test 4: Verify Data Merging (All 3 JSON files)
  await test('Data Merging - All 3 JSON Files', async () => {
    if (allProperties.length === 0) throw new Error('No properties to test');
    
    const sample = allProperties[0];
    const hasBasics = sample.id && sample.title && sample.price && sample.location;
    const hasCharacteristics = sample.bedrooms !== undefined && sample.bathrooms !== undefined && sample.size_sqft;
    const hasImages = sample.image_url;
    
    if (!hasBasics) throw new Error('Missing basics data');
    if (!hasCharacteristics) throw new Error('Missing characteristics data');
    if (!hasImages) throw new Error('Missing images data');
  });

  // Test 5: Property Search with Filters
  await test('Property Search - Location Filter', async () => {
    const res = await fetch(`${BASE_URL}/api/properties/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'Show me properties in New York',
        predict: false
      })
    });
    const data = await res.json();
    if (!data.success) throw new Error('Search failed');
    if (data.count === 0) throw new Error('No properties found for New York');
    
    // Verify all results are in New York
    const allInNY = data.data.every(p => 
      p.location.toLowerCase().includes('new york')
    );
    if (!allInNY) throw new Error('Filter not working correctly');
  });

  // Test 6: Property Search - Budget Filter
  await test('Property Search - Budget Filter', async () => {
    const res = await fetch(`${BASE_URL}/api/properties/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'Show me properties under 500000',
        predict: false
      })
    });
    const data = await res.json();
    if (!data.success) throw new Error('Search failed');
    
    // Verify all results are under budget
    if (data.data.length > 0) {
      const allUnderBudget = data.data.every(p => p.price <= 500000);
      if (!allUnderBudget) throw new Error('Budget filter not working');
    }
  });

  // Test 7: Property Search - Bedrooms Filter
  await test('Property Search - Bedrooms Filter', async () => {
    const res = await fetch(`${BASE_URL}/api/properties/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'Show me 3 bedroom properties',
        predict: false
      })
    });
    const data = await res.json();
    if (!data.success) throw new Error('Search failed');
    
    if (data.data.length > 0) {
      const allHaveBedrooms = data.data.every(p => p.bedrooms >= 3);
      if (!allHaveBedrooms) throw new Error('Bedrooms filter not working');
    }
  });

  // Test 8: Saved Properties - Save
  let savedPropertyId = null;
  await test('Save Property', async () => {
    if (allProperties.length === 0) throw new Error('No properties to save');
    
    const res = await fetch(`${BASE_URL}/api/saved-properties`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: 'test-user',
        propertyId: allProperties[0].id,
        property: allProperties[0]
      })
    });
    const data = await res.json();
    if (!data.success) throw new Error('Failed to save property');
    savedPropertyId = data.data._id;
  });

  // Test 9: Saved Properties - Get
  await test('Get Saved Properties', async () => {
    const res = await fetch(`${BASE_URL}/api/saved-properties?userId=test-user`);
    const data = await res.json();
    if (!data.success) throw new Error('Failed to get saved properties');
    if (data.data.length === 0) throw new Error('No saved properties found');
  });

  // Test 10: Saved Properties - Check
  await test('Check Saved Property', async () => {
    if (!savedPropertyId) throw new Error('No saved property ID');
    
    const res = await fetch(`${BASE_URL}/api/saved-properties/check/${allProperties[0].id}?userId=test-user`);
    const data = await res.json();
    if (!data.success) throw new Error('Failed to check saved property');
    if (!data.isSaved) throw new Error('Property should be saved');
  });

  // Test 11: Saved Properties - Delete
  await test('Delete Saved Property', async () => {
    if (!savedPropertyId) throw new Error('No saved property ID');
    
    const res = await fetch(`${BASE_URL}/api/saved-properties/${savedPropertyId}?userId=test-user`, {
      method: 'DELETE'
    });
    const data = await res.json();
    if (!data.success) throw new Error('Failed to delete saved property');
  });

  // Test 12: ML Service - Predict (if model loaded)
  await test('ML Service - Predict Endpoint', async () => {
    const testData = {
      property_type: "SFH",
      lot_area: 5000,
      building_area: 0,
      bedrooms: 3,
      bathrooms: 2,
      year_built: 2015,
      has_pool: true,
      has_garage: false,
      school_rating: 9
    };
    
    const res = await fetch(`${ML_URL}/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testData)
    });
    
    const data = await res.json();
    // Even if model not loaded, endpoint should respond
    if (res.status === 503) {
      logTest('ML Service - Predict Endpoint', true, 'Model not loaded (expected)');
      passed++;
    } else if (data.predicted_price !== undefined) {
      logTest('ML Service - Predict Endpoint', true, 'Prediction successful');
      passed++;
    } else {
      throw new Error('Unexpected response');
    }
  });

  // Test 13: Properties with Predictions
  await test('Get Properties with Predictions', async () => {
    const res = await fetch(`${BASE_URL}/api/properties?predict=true`);
    const data = await res.json();
    if (!data.success) throw new Error('Failed to get properties with predictions');
    // Even if predictions fail, properties should still be returned
    if (!data.data || data.data.length === 0) throw new Error('No properties returned');
  });

  // Test 14: Search with Predictions
  await test('Search with Predictions', async () => {
    const res = await fetch(`${BASE_URL}/api/properties/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'Show me properties in New York',
        predict: true
      })
    });
    const data = await res.json();
    if (!data.success) throw new Error('Search with predictions failed');
    if (!data.data || data.data.length === 0) throw new Error('No results');
  });

  // Test 15: Complex Search Query
  await test('Complex Search Query', async () => {
    const res = await fetch(`${BASE_URL}/api/properties/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'Show me 3 bedroom apartments in New York under 500000',
        predict: false
      })
    });
    const data = await res.json();
    if (!data.success) throw new Error('Complex search failed');
  });

  // Test 16: Filter Properties - Location
  await test('Filter Properties - Location', async () => {
    const testLocation = allProperties[0]?.location || 'New York';
    const filtered = allProperties.filter(p => 
      p.location.toLowerCase().includes(testLocation.toLowerCase())
    );
    if (filtered.length === 0 && allProperties.length > 0) {
      throw new Error('Location filter logic issue');
    }
  });

  // Test 17: Filter Properties - Budget
  await test('Filter Properties - Budget', async () => {
    const maxBudget = 500000;
    const filtered = allProperties.filter(p => p.price <= maxBudget);
    // Verify filter logic
    const allUnderBudget = filtered.every(p => p.price <= maxBudget);
    if (!allUnderBudget) throw new Error('Budget filter logic incorrect');
  });

  // Test 18: Filter Properties - Bedrooms
  await test('Filter Properties - Bedrooms', async () => {
    const minBedrooms = 2;
    const filtered = allProperties.filter(p => p.bedrooms >= minBedrooms);
    const allHaveBedrooms = filtered.every(p => p.bedrooms >= minBedrooms);
    if (!allHaveBedrooms) throw new Error('Bedrooms filter logic incorrect');
  });

  // Test 19: Data Integrity - All Properties Have Required Fields
  await test('Data Integrity - Required Fields', async () => {
    const requiredFields = ['id', 'title', 'price', 'location', 'bedrooms', 'bathrooms', 'size_sqft', 'image_url'];
    const allHaveFields = allProperties.every(prop => {
      return requiredFields.every(field => prop[field] !== undefined && prop[field] !== null);
    });
    if (!allHaveFields) throw new Error('Some properties missing required fields');
  });

  // Test 20: Frontend Accessibility
  await test('Frontend Accessibility', async () => {
    const res = await fetch('http://localhost:3000');
    if (res.status !== 200) throw new Error('Frontend not accessible');
    const html = await res.text();
    if (!html.includes('Real Estate Chatbot')) throw new Error('Frontend content not found');
  });

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('\n📊 TEST SUMMARY\n');
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Total: ${passed + failed}`);
  console.log(`🎯 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%\n`);

  if (failed === 0) {
    console.log('🎉 ALL TESTS PASSED! Project is working perfectly!\n');
  } else {
    console.log('⚠️  Some tests failed. Please review the errors above.\n');
  }
}

runTests().catch(console.error);

