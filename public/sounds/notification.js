// Script para generar un sonido de notificación
// Ejecutar con Node.js: node notification.js

const fs = require('fs');
const { AudioContext } = require('web-audio-api');

// Crear contexto de audio
const audioContext = new AudioContext();
const sampleRate = 44100;
const duration = 0.5; // duración en segundos

// Crear un buffer de audio
const buffer = audioContext.createBuffer(1, sampleRate * duration, sampleRate);
const channelData = buffer.getChannelData(0);

// Generar un sonido simple de notificación (ding)
for (let i = 0; i < buffer.length; i++) {
    // Frecuencia que disminuye (de 880Hz a 440Hz)
    const frequency = 880 - (i / buffer.length) * 440;
    // Amplitud que disminuye con el tiempo
    const amplitude = 0.5 * Math.pow(1 - i / buffer.length, 0.5);
    // Valor de la muestra
    channelData[i] = amplitude * Math.sin(frequency * Math.PI * 2 * i / sampleRate);
}

// Convertir a formato WAV
const wavData = audioContext.encodeSync(buffer, 'wav');

// Guardar el archivo
fs.writeFileSync('notification.mp3', wavData);

console.log('Archivo de sonido creado: notification.mp3'); 