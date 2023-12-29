import React, { useState, useEffect } from 'react';
import { Layout, Input, Button, Select } from 'antd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeadphones, faStop, faMicrophone } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import lottie from "lottie-web";
import { defineElement } from "@lordicon/element";

//@ts-ignore
import userImg from './images/user-img.png';

// define "lord-icon" custom element with default properties


import './App.css';

//@ts-ignore
import imageSrc from './images/aris-logo-cut.png';
//@ts-ignore
import imageSrc1 from './images/SVKl.gif'

defineElement(lottie.loadAnimation);

const { Header, Footer, Content } = Layout;

const App: React.FC = () => {
  const [selectedProfile, setSelectedProfile] = useState<string>('');
  const [prompt, setPrompt] = useState<string>('');
  const [isSearchClicked, setIsSearchClicked] = useState<boolean>(true);
  const [isInputTyped, setIsInputTyped] = useState<boolean>(false);
  const [isMicClicked, setIsMicClicked] = useState<boolean>(false);
  const [Playing, setIsPlaying] = useState<boolean>(false);
  const [profileSelected, setProfileSelected] = useState<boolean>(true);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [voiceType, setVoiceType] = useState('echo');
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const [chatMessages, setChatMessages] = useState([
    {
      user: '',
      bot: 'Hey! I am ARIS, your Personal Life Coach. How do you want me guide you today?',
    },
    {
      user: '',
      bot: 'hello',
    }
  ]);

  const onChange = (value: string) => {
    setSelectedProfile(value);
    setProfileSelected(false);
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

  const startRecording = async () => {
    setIsMicClicked(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      setMediaRecorder(recorder);      
      recorder.ondataavailable = async (e) => {
        const audioBlob = e.data;     
        try {
          const formData = new FormData();
          formData.append('audio_file', audioBlob, 'audio.wav');          
          const url = `https://107.22.70.97:8000/ARISvoiceAPI?Profile_name=${selectedProfile}`;
          const response = await axios.post(url, formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
              'accept': 'application/json'
            }
          });          
          console.log('ARISvoiceAPI response:', response.data);
          addUserMessage(response.data.user_message);
          addBotMessage(response.data.result.response);
          setIsSearchClicked(true);
        } catch (error) {
          console.error('Error handling audio:', error);
        }
      };      
      recorder.start();
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };

  const stopRecording = () => {
    setIsMicClicked(false);
    setIsSearchClicked(false);
    mediaRecorder.stop();
  };

  const handlePlay = async (text: string, voiceType: string) => {
    setIsPlaying(true);
    try {
      const response = await axios.post(
        `http://107.22.70.97:8000/generate_audio/?text=${text}&voice=${voiceType}`,
        {},
        {
          responseType: 'blob', // Set the responseType to 'blob' to get binary data
        }
      );
  
      const audioBlob = response.data; // Access the data property of the response
      const audioUrl = URL.createObjectURL(audioBlob);
  
      const newAudio = new Audio(audioUrl);
      setAudio(newAudio);
    } catch (error) {
      console.error('Error fetching audio:', error);
    }
  };

  useEffect(() => {
    if (audio) {
      audio.play();
      audio.onended = () => setIsPlaying(false);
    }
  }, [audio]);


  const handleStop = (audio: any) => {
    if (audio) {
      audio.pause();
      audio.currentTime = 0; // Rewind the audio to the beginning
    }
    setIsPlaying(false);
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

      addBotMessage(response.data.response);
      setIsSearchClicked(true);
      console.log('success:', response.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      alert('Error fetching data');
    }
  };

  const addBotMessage = (message: string) => {
    // @ts-ignore
      setChatMessages((prevMessages) => [
        ...prevMessages,
        {
          user: '',
          bot: message,// Update this with the actual duration when playing the audio
        },
      ]);
    };


  const addUserMessage = (message: string) => {
    // @ts-ignore
    setChatMessages((prevMessages) => [
      ...prevMessages,
      {
        user: message,
        bot: '', // Update this with the actual duration when playing the audio
      },
    ]);
  };

  const headerStyle: React.CSSProperties = {
    textAlign: 'center',
    color: '#95AEB7',
    backgroundColor: 'black',
    height: 130,
    lineHeight: '0.3',
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
    bottom: '110px',
    color: 'white',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
  };


  return (
    <Layout style={{ ...layoutStyle, ...{ animation: 'fadeIn 2s ease-in-out' } }} >
      <Header style={headerStyle}>
        <h2>
        <svg width="99" height="40" viewBox="0 0 99 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path opacity="0.7" d="M11.9827 31.798L5.94434 21.2969H18.7391L24.7177 31.8379L11.9827 31.798Z" fill="white"/>
          <path d="M36.704 31.7477L24.717 31.8374L12.5006 10.2967L18.4492 0L36.704 31.7477Z" fill="white"/>
          <path d="M16.6991 40H4.76689L0 31.5931L5.94365 21.2964L16.6991 40Z" fill="white"/>
          <path d="M50.6057 26.657L49.4588 30.651H44.667L51.1392 11.6084H56.0407L62.5129 30.651H57.7211L56.5493 26.657H50.6057ZM53.5625 15.9515C53.5625 15.9515 53.1387 18.0307 52.7897 19.2274L51.6977 22.9273H55.4523L54.3853 19.2274C54.0412 18.0307 53.6124 15.9515 53.6124 15.9515H53.5575H53.5625Z" fill="white"/>
          <path d="M64.1035 16.9338H68.5264V19.2524C68.5264 19.7061 68.4715 20.105 68.4715 20.105H68.5264C69.1098 18.2402 70.845 16.6944 72.8944 16.6944C73.1586 16.6944 73.4279 16.7493 73.4279 16.7493V21.2768C73.4279 21.2768 73.0539 21.197 72.4955 21.197C71.4035 21.197 69.6184 21.5411 68.9552 23.5954C68.7956 24.099 68.7158 24.7124 68.7158 25.4603V30.651H64.1085V16.9387L64.1035 16.9338Z" fill="white"/>
          <path d="M75.5521 16.9338H80.1594V30.646H75.5521V16.9338ZM75.6069 11.6084H80.1095V15.2035H75.6069V11.6084Z" fill="white"/>
          <path d="M84.4725 25.8542C84.4725 25.8542 85.9883 27.2404 87.9629 27.2404C88.656 27.2404 89.3192 27.0559 89.3192 26.6022C89.3192 25.4055 82.9018 25.2708 82.9018 20.7981C82.9018 18.2152 85.38 16.6196 88.5463 16.6196C91.7126 16.6196 93.3681 18.1903 93.3681 18.1903L91.7974 21.4663C91.7974 21.4663 90.466 20.3494 88.5513 20.3494C87.8582 20.3494 87.195 20.5339 87.195 21.0125C87.195 22.0497 93.6124 22.2092 93.6124 26.6321C93.6124 28.9756 91.5331 30.9751 87.9928 30.9751C84.4526 30.9751 82.5079 28.9507 82.5079 28.9507L84.4775 25.8642L84.4725 25.8542Z" fill="white"/>
          <path d="M96.4847 31.0146V31.2889H95.9562V32.6651H95.6321V31.2889H95.1035V31.0146H96.4847Z" fill="white"/>
          <path d="M98.2698 32.6651L98.21 31.6928C98.205 31.5631 98.205 31.4086 98.2 31.234H98.1801C98.1352 31.3786 98.0903 31.5731 98.0404 31.7277L97.7413 32.6452H97.4022L97.103 31.7077C97.0731 31.5781 97.0232 31.3886 96.9883 31.239H96.9684C96.9684 31.3886 96.9634 31.5482 96.9584 31.6978L96.8986 32.6701H96.5844L96.7041 31.0196H97.1978L97.482 31.8274C97.5169 31.9571 97.5468 32.0767 97.5917 32.2463H97.5967C97.6415 32.0967 97.6764 31.9571 97.7113 31.8324L97.9956 31.0196H98.4693L98.5989 32.6701H98.2698V32.6651Z" fill="white"/>
          </svg>
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
        <Select
      defaultValue="echo"
      style={{ width: 100, marginLeft: '10px' }}
      onChange={(value) => setVoiceType(value)}
      suffixIcon={
        //@ts-ignore
      <lord-icon
        src="https://cdn.lordicon.com/bgebyztw.json"
        trigger="loop"
        state="hover-looking-around"
        colors='primary:#ffffff,secondary:#e4e4e4'
        style={{ width: '25px', height: '25px' }}/>}
      options={[
        { value: 'echo', label: 'echo' },
        { value: 'alloy', label: 'alloy' },
        { value: 'fable', label: 'fable' },
        { value: 'onyx', label: 'onyx' },
        { value: 'nova', label: 'nova' },
        { value: 'shimmer', label: 'shimmer' },
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
                <div style={{ display: 'flex' }}>
                <div className="user">
                  <div className="message-content"> {message.user}</div>
                </div>
                <img src={userImg} alt="User" style={{ width: '40px', height: '40px', borderRadius: '50%' }} />
                </div>
              )}
              {message.bot && (
                <div style={{ display: 'flex' }}>
                  <img src={imageSrc} alt="Aris Logo" style={{ width: '40px', height: '40px', borderRadius: '50%' }} />
                  <div className="bot">
                    <div className="message-content">
                      {message.bot}
                    </div>
                  </div>
                  {Playing ? 
                  //@ts-ignore
                  (<lord-icon
                    src="https://cdn.lordicon.com/bpmdxzpd.json"
                    trigger="loop"
                    state="loop-recording"
                    colors="primary:#ffffff,secondary:#000000,tertiary:#000000,quaternary:#ebe6ef,quinary:#000000"
                    style={{ width: '50px', height: '50px', marginTop: '12px', marginLeft: '10px'}}
                    onClick={() => handleStop(audio)}/>
                    ) : (
                  // @ts-ignore
                <lord-icon
                    src="https://cdn.lordicon.com/bpmdxzpd.json"
                    trigger="hover"
                    colors="primary:#ffffff,secondary:#000000,tertiary:#000000,quaternary:#ebe6ef,quinary:#000000"
                    style={{ width: '50px', height: '50px', marginTop: '12px', marginLeft: '10px'}}
                    onClick={() => handlePlay(message.bot, voiceType)}/>)}
                </div>
                )}
            </div>
          ))}
        </div>
        {!isSearchClicked && (
          <>
          <div style={{ textAlign: 'center', marginTop: '50px' }}>

      </div>
          <div style={typingMessageStyle} className="spinner-box bot-typing">
          <div className="pulse-container">  
            <div className="pulse-bubble pulse-bubble-1"></div>
            <div className="pulse-bubble pulse-bubble-2"></div>
            <div className="pulse-bubble pulse-bubble-3"></div>
          </div>
        </div>
          </>
        )}
      </Content>
      <Footer style={footerStyle}>
      <Input
          style={ButtonStyle}
          placeholder="Ask your quey here . . ."
          value={prompt}  // Use the prompt state as the input value
          onChange={onInputChange}
          onPressEnter={handleSubmit}
          disabled={profileSelected}
        />
        {!isMicClicked ? (<Button
          icon={<FontAwesomeIcon icon={faHeadphones} />}
          style={voiceButton}
          onClick={startRecording}
          disabled={profileSelected}
        />) : 
        (
          <Button
          icon={<FontAwesomeIcon icon={faStop} />}
          style={voiceButton}
          onClick={stopRecording}
          />
        )
        }
        
        
        {isInputTyped ? (
          //@ts-ignore
        <lord-icon
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
            />) : (
              //@ts-ignore
            <lord-icon
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
              }}/>)}
      </Footer>
    </Layout>
  );
};

export default App;