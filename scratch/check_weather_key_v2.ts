import fetch from 'node-fetch';

const key = 'b48c937c0b252f91aa04e351116bfa01';
// Sample coords (Delhi)
const lat = 28.6139;
const lon = 77.2090;

async function checkKey() {
    try {
        console.log(`Checking key: ${key}...`);
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${key}&units=metric`);
        const data = await response.json();
        
        if (response.ok) {
            console.log('✅ API Key is VALID');
            console.log(`Location: ${data.name}, ${data.sys.country}`);
            console.log(`Temp: ${data.main.temp}°C, Humidity: ${data.main.humidity}%`);
        } else {
            console.log('❌ API Key is INVALID or INACTIVE');
            console.log('Error:', data.message);
        }
    } catch (e) {
        console.log('❌ Connection error:', e.message);
    }
}

checkKey();
