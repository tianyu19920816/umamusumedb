import { S3Client, ListBucketsCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const client = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

async function testR2Connection() {
  console.log('🔍 Testing R2 connection...\n');
  console.log('📝 Using bucket:', process.env.R2_BUCKET_NAME);
  console.log('🔗 Endpoint:', process.env.R2_ENDPOINT);
  
  try {
    // Skip listing buckets (may not have permission)
    // Directly test upload to known bucket
    
    // Test: Upload a test file
    console.log('\n📤 Uploading test file...');
    const testContent = JSON.stringify({ 
      test: true, 
      timestamp: new Date().toISOString() 
    });
    
    const putCommand = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: 'test/connection-test.json',
      Body: testContent,
      ContentType: 'application/json',
    });
    
    await client.send(putCommand);
    console.log('✅ Test file uploaded successfully!');
    
    // Show public URL
    const publicUrl = `${process.env.R2_PUBLIC_URL}/${process.env.R2_BUCKET_NAME}/test/connection-test.json`;
    console.log('\n🌐 If public access is enabled, file should be available at:');
    console.log(`   ${publicUrl}`);
    
    console.log('\n✨ R2 connection test successful!');
    console.log('📌 Your R2 bucket is ready to use.');
    
  } catch (error) {
    console.error('❌ R2 connection test failed:', error.message);
    console.error('\n🔧 Please check:');
    console.error('   1. Your credentials in .env file');
    console.error('   2. The bucket name is correct');
    console.error('   3. Your API token has R2 permissions');
  }
}

testR2Connection();