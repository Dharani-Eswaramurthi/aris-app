import React, { useState } from 'react';
import axios from 'axios';

const AudioRecorder = () => {
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioURL, setAudioURL] = useState('');
  const [selectedProfile, setSelectedProfile] = useState(''); // Add state for the selected profile  
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      setMediaRecorder(recorder);      recorder.ondataavailable = async (e) => {
        const audioBlob = e.data;
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudioURL(audioUrl);        try {
          const formData = new FormData();
          formData.append('audio_file', audioBlob, 'audio.wav');          
          const url = `http://localhost:8000/ARISvoiceAPI?Profile_name=${selectedProfile}`;
          const response = await axios.post(url, formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
              'accept': 'application/json'
            }
          });          console.log('ARISvoiceAPI response:', response.data);
        } catch (error) {
          console.error('Error handling audio:', error);
        }
      };      recorder.start();
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };  const stopRecording = () => {
    mediaRecorder.stop();
  };  // Add a way to set the selectedProfile
  const handleProfileChange = (e) => {
    setSelectedProfile(e.target.value);
  };  return (
    <div>
      <input type="text" value={selectedProfile} onChange={handleProfileChange} placeholder="Enter Profile Name" />
      <button onClick={startRecording}>Start Recording</button>
      <button onClick={stopRecording}>Stop Recording</button>
      {audioURL && <audio src={audioURL} controls />}
    </div>
  );
};

export default AudioRecorder;