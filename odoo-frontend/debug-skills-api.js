// Test file to verify skills API response structure
// You can run this in the browser console to debug

fetch('/api/skills?isVerified=true&limit=3')
  .then(response => response.json())
  .then(data => {
    console.log('Skills API Response:', data);
    console.log('Skills array:', data.data?.skills);
    console.log('Is skills an array?', Array.isArray(data.data?.skills));
    if (data.data?.skills && data.data.skills.length > 0) {
      console.log('First skill:', data.data.skills[0]);
    }
  })
  .catch(error => console.error('API Error:', error));

fetch('/api/skills/categories')
  .then(response => response.json())
  .then(data => {
    console.log('Categories API Response:', data);
    console.log('Categories array:', data.data);
    console.log('Is categories an array?', Array.isArray(data.data));
  })
  .catch(error => console.error('Categories API Error:', error));
