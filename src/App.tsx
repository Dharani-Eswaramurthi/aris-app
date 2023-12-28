import React, { useState, useEffect } from 'react';
import { Layout, Input, Button, Select } from 'antd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeadphones, faStop, faPlay } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import lottie from "lottie-web";
import { defineElement } from "@lordicon/element";

// define "lord-icon" custom element with default properties


import './App.css';
import imageSrc from './surepeople_logo.png';
import imageSrc1 from './SVKl.gif'

defineElement(lottie.loadAnimation);

const { Option } = Select;

const { Header, Footer, Content } = Layout;

const App: React.FC = () => {
  const [selectedProfile, setSelectedProfile] = useState<string>('');
  const [prompt, setPrompt] = useState<string>('');
  const [result, setResult] = useState<string>('');
  const [isSearchClicked, setIsSearchClicked] = useState<boolean>(true);
  const [isInputTyped, setIsInputTyped] = useState<boolean>(false);
  const [isMicClicked, setIsMicClicked] = useState<boolean>(false);
  const [recording, setRecording] = useState<MediaRecorder | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [chatMessages, setChatMessages] = useState([
    {
      user: '',
      bot: 'Hey! I am ARIS, your Personal Executive Coach. How do you want me guide you today?',
      audioBlob: null, // Add this property for voice recording
      audioDuration: '', // Add this property for voice recording duration
    },
  ]);

  const onChange = (value: string) => {
    setSelectedProfile(value);
  };

  const onSearch = (value: string) => {
    setPrompt(value);
    setIsSearchClicked(true);
  };

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setPrompt(inputValue);
    setIsInputTyped(!!inputValue.trim());
  };

  const handleMic = () => {
    try {
      navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
        const recorder = new MediaRecorder(stream);
        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) {
            const blob = new Blob([e.data], { type: 'audio/wav' });
            addBotMessage('Voice Message', blob);
          }
        };
        recorder.onstop = () => {
          stream.getTracks().forEach((track) => track.stop());
        };
        recorder.start();
        setRecording(recorder);
      });
      setIsMicClicked(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  };

  const handleStop = async () => {
    if (recording) {
      recording.stop();
      setRecording(null);
      setIsMicClicked(false);
  
      try {
        // Convert the recorded audio blob to a FormData object
        const formData = new FormData();
        formData.append('audio_file', recording);
        formData.append('History', JSON.stringify(chatMessages));
  
        // Send the recorded audio to the ARISvoiceAPI
        const response = await axios.post(`http://107.22.70.97:8000/ARISvoiceAPI?Profile_name=${selectedProfile}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
  
        // Handle the API response as needed
        console.log('ARISvoiceAPI response:', response.data.response);
        
        // If you want to add the bot's response to the chat after processing the audio, you can do something like this:
        if (response.data.botResponse) {
          addBotMessage(response.data.botResponse, response.data.botAudioBlob);
        }
      } catch (error) {
        console.error('Error sending recorded audio to ARISvoiceAPI:', error);
      }
    }
  };

  const handlePlay = (audioBlob: Blob) => {
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);
    audio.play();
  };


  const handleSubmit = async () => {
    addUserMessage(prompt);
    console.log('prompt:', chatMessages);
    setIsSearchClicked(false);
    setIsInputTyped(false);
    setPrompt('');
    // Check if prompt is not empty before making the API call
    if (prompt.trim() === '') {
      return;
    }

    try {
      const response = await axios.get(`http://107.22.70.97:8000/ARISmasterAPI?Profile_name=${selectedProfile}&query=${prompt}`);

      setResult(response.data.response);
      setIsSearchClicked(true);
      addBotMessage(response.data.response, '');
      console.log('success:', response.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      setResult('Error fetching data');
    }
  };

  const addBotMessage = (message: string) => {
    // @ts-ignore
      setChatMessages((prevMessages) => [
        ...prevMessages,
        {
          user: '',
          bot: message,
          audioBlob: null,
          audioDuration: '10', // Update this with the actual duration when playing the audio
        },
      ]);
    };


  const addUserMessage = (message: string) => {
    // @ts-ignore
    setChatMessages((prevMessages) => [
      ...prevMessages,
      {
        user: message,
        bot: '',
        audioBlob: audioBlob,
        audioDuration: '10', // Update this with the actual duration when playing the audio
      },
    ]);
  };

  const headerStyle: React.CSSProperties = {
    textAlign: 'center',
    color: 'orange',
    backgroundColor: 'black',
    height: 130,
    lineHeight: '0.3',
    padding: '20px',
    fontFamily: 'MyFont',
    marginLeft: '20px',
    marginRight: '20px',
    borderBottom: '1px solid gray',
  };

  const contentStyle: React.CSSProperties = {
    lineHeight: '25px',
    color: '#fff',
    paddingLeft: '20px',
    paddingRight: '20px',
    overflowY: 'auto',
    overflowX: 'auto',
    maxHeight: 'calc(100vh - 64px)',
  };

  const footerStyle: React.CSSProperties = {
    textAlign: 'center',
    color: 'white',
    borderTop: '1px solid gray',
    backgroundColor: 'black',
    marginLeft: '20px',
    marginRight: '20px',
    boxShadow: '0px 5px 5px 5px rgba(0, 0, 0, 1)',
  };

  const layoutStyle = {
    overflow: 'hidden',
    height: '100vh',
    backgroundColor: 'black',
  };

  const ButtonStyle = {
    borderRadius: '25px',
    color: 'white',
    backgroundColor: '#58545B',
    width: '75%',
    height: '50px',
    marginRight: '8px',
    caretColor: 'white',
  };

  const voiceButton: React.CSSProperties = {
    borderRadius: '100px',
    color: 'white',
    backgroundColor: '#58545B',
    width: '35px',
    height: '35px',
    marginLeft: '-50px',
    borderColor: 'transparent',
    position: 'absolute',
    marginTop: '10px',
  };

  const SelectStyle = {
    width: '50%',
  };

  const typingMessageStyle: React.CSSProperties = {
    position: 'absolute',
    bottom: '5px',
    left: '20px',
    color: 'gray',
  };

  const waterStyle: React.CSSProperties = {
    position: 'relative',
    height: '20px', // Should match the height in the CSS
    overflow: 'hidden',
  };

  return (
    <Layout style={{ ...layoutStyle, ...{ animation: 'fadeIn 2s ease-in-out' } }} >
      <Header style={headerStyle}>
      <div>
        {/* <svg className="waves" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" viewBox="0 24 150 28" preserveAspectRatio="none" shapeRendering="auto">
      <defs>
        <path id="gentle-wave" d="M-160 44c30 0 58-18 88-18s 58 18 88 18 58-18 88-18 58 18 88 18 v44h-352z" />
      </defs>
      <g className="parallax">
        <use xlinkHref="#gentle-wave" x="48" y="0" fill="rgba(255,255,255,0.7)" />
        <use xlinkHref="#gentle-wave" x="48" y="3" fill="rgba(255,255,255,0.5)" />
        <use xlinkHref="#gentle-wave" x="48" y="5" fill="rgba(255,255,255,0.3)" />
        <use xlinkHref="#gentle-wave" x="48" y="7" fill="#fff" />
      </g>
    </svg> */}
      </div>
        <h2>
          ARIS.AI
          <br />
          <br />
        </h2>
        <Select
          style={SelectStyle}
          showSearch
          placeholder="Choose a Prism Profile"
          optionFilterProp="children"
          onChange={onChange}
          onSearch={onSearch}
          filterOption={(input: string, option?: { label: string; value: string }) =>
            (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
          }
          options={[
            { value: 'Anagnostopoulos', label: 'Anagnostopoulos' },
            { value: 'Drakoulis', label: 'Drakoulis' },
            { value: 'Flynns', label: 'Flynns' },
            { value: 'Karoubas', label: 'Karoubas' },
            { value: 'Lolis', label: 'Lolis' },
            { value: 'Paul', label: 'Paul' },
            { value: 'Stankiewicz', label: 'Stankiewicz' },
            { value: 'Yanni', label: 'Yanni' },
            // Add other options
          ]}
        />
      </Header>
      <Content style={contentStyle}>
        {isMicClicked && (
          <div className="pop-out-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
            <img className="pop-out-image" style={{ width: '200px', height: '200px' }} src={imageSrc1} alt="SurePeople Logo" />
          </div>
        )}
        <div className="chat-container">
          {chatMessages.map((message, index) => (
            <div key={index} className={`message ${message.user ? 'user-message' : 'bot-message'}`}>
              {message.user && (
                <div className="user">
                  <div className="message-content"> {message.user}</div>
                </div>
              )}
              {message.bot && (
                <div className="bot">
                  <div className="message-content">
                    {message.audioBlob ? (
                      <>
                        <button className="play-button" onClick={() => handlePlay(message.audioBlob)}>
                          <FontAwesomeIcon icon={faPlay} />
                        </button>
                        <span className="audio-duration">{message.audioDuration}</span>
                      </>
                    ) : (<>
                    {/* <img src={imageSrc} style={{width: '20px', height: '20px'}}/> */}
                    {message.bot}
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        {isSearchClicked && (
          <div style={typingMessageStyle}>Aris is typing...</div>
        )}
      </Content>
      <Footer style={footerStyle}>
      <Input
          style={ButtonStyle}
          placeholder="Ask your quey here . . ."
          value={prompt}  // Use the prompt state as the input value
          onChange={onInputChange}
          onPressEnter={handleSubmit}
        />
        {!isMicClicked ? (<Button
          icon={<FontAwesomeIcon icon={faHeadphones} />}
          style={voiceButton}
          onClick={handleMic}
        />) : 
        (
          <Button
          icon={<FontAwesomeIcon icon={faStop} />}
          style={voiceButton}
          onClick={handleStop}/>
        )
        }
        
        
        {isInputTyped ? (<lord-icon
            src="https://cdn.lordicon.com/jtkfemwz.json"
            trigger="morph"
            state="morph-check"
            style={{
              color: isInputTyped ? '#58545B' : 'black',
              paddingTop: '8px',
              paddingLeft: '8px',
              width: '35px',
              height: '35px', // Remove border for a cleaner look
              cursor: isInputTyped ? 'pointer' : 'not-allowed', // Change cursor based on the input state
            }}
            onClick={handleSubmit}
            >
        </lord-icon>) : (<lord-icon
              src="https://cdn.lordicon.com/jtkfemwz.json"
              trigger="morph"
              state="morph-cross"
              style={{
                color: isInputTyped ? '#58545B' : 'black',
                paddingTop: '8px',
                paddingLeft: '8px',
                width: '35px',
                height: '35px', // Remove border for a cleaner look
                cursor: isInputTyped ? 'pointer' : 'not-allowed', // Change cursor based on the input state
              }}>
          </lord-icon>)
}
        {/* <Button
          shape="circle"
          onClick={handleSubmit}
          icon={}
          disabled={!isInputTyped}
          style={{
            borderRadius: '50%',
            color: isInputTyped ? '#58545B' : 'black',
            backgroundColor: isInputTyped ? 'white' : '#58545B', // Change the background color for the disabled state
            width: '35px',
            height: '35px',
            border: 'none', // Remove border for a cleaner look
            cursor: isInputTyped ? 'pointer' : 'not-allowed', // Change cursor based on the input state
          }}
        /> */}
      </Footer>
    </Layout>
  );
};

export default App;