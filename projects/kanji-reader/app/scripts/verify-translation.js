
const https = require('https');

// Load environment variables if not already loaded (simple fallback)
const apiKey = process.env.EXPO_PUBLIC_GOOGLE_TRANSLATE_API_KEY;

if (!apiKey) {
  console.error('Error: EXPO_PUBLIC_GOOGLE_TRANSLATE_API_KEY is not set.');
  process.exit(1);
}

const text = 'こんにちは';
const target = 'en';
const url = `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`;

const data = JSON.stringify({
  q: text,
  target: target,
  format: 'text'
});

const options = {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data),
  },
};

console.log(`Testing Translation API with key: ${apiKey.substring(0, 5)}...`);

const req = https.request(url, options, (res) => {
  let body = '';

  res.on('data', (chunk) => {
    body += chunk;
  });

  res.on('end', () => {
    if (res.statusCode >= 200 && res.statusCode < 300) {
      try {
        const response = JSON.parse(body);
        const translation = response.data.translations[0].translatedText;
        console.log('SUCCESS: API Call worked.');
        console.log(`Original: ${text}`);
        console.log(`Translation: ${translation}`);
      } catch (e) {
        console.error('Error parsing response:', e);
        console.error('Body:', body);
      }
    } else {
      console.error(`API Error: ${res.statusCode}`);
      console.error('Body:', body);
    }
  });
});

req.on('error', (e) => {
  console.error('Request Error:', e);
});

req.write(data);
req.end();
