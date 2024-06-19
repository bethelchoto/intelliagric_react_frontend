import "../Styles/Home.css";
import React, { useEffect, useState, useRef } from 'react';
import { Container, Row, Col, Modal, Button, Form } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faImage, faArrowUp, faMicrochip} from '@fortawesome/free-solid-svg-icons';
import HomeNavBar from "../components/homeNavBar";
import Sidebar from '../components/sideBar';
import { UserAuth } from "../context/AuthContext";

const Home = () => {
  const { user, logout, idToken } = UserAuth();

  const [chatHistory, setChatHistory] = useState([]);
  const [maxScrollHeight, setMaxScrollHeight] = useState(0);
  const [farmOverview, setFarmOverview] = useState(null);
  const [formData, setFormData] = useState({ message: "" });
  const fileInputRef = useRef(null);

  useEffect(() => {
    const windowHeight = window.innerHeight;
    const calculatedMaxScrollHeight = windowHeight - 200;
    setMaxScrollHeight(calculatedMaxScrollHeight);
  }, []);

  const handleChat = async (e) => {
    e.preventDefault();
    console.log("Submitting form data:", formData);

    if (!formData.message) {
      alert("Please enter a message");
      return;
    }

    const requestData = {
      message: formData.message,
    };

    try {
      const response = await fetch(
        "http://127.0.0.1:5000/chat",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            'Authorization': `Bearer ${idToken}`,
          },
          body: JSON.stringify(requestData),
        }
      );
      
      var intent_response = await response.json();

      // Handling response from chat
      const handleChatResponse = async (chat_response) => {
        try {
            let responseObj = JSON.parse(chat_response.response);
            if (!responseObj.response && responseObj.intent === "#Predict Agriculture Market") {
                console.log("Returned response: ", responseObj.response);
                console.log("Returned intent: ", responseObj.intent);
                console.log("Go to Predict Market endpoint");

                Object.assign(responseObj, requestData);

                console.log("ResponseObj: ", responseObj);

                const response = await fetch(
                  "http://127.0.0.1:5000/predict-market",
                  {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                      'Authorization': `Bearer ${idToken}`,
                    },
                    body: JSON.stringify(responseObj),
                  }
                );
                intent_response = await response.json();

            } 

        } catch (error) {
            console.error("Error handling intent response:", error);
        }
      };

      handleChatResponse(intent_response);

      setFarmOverview(intent_response.response);
      
        // Parse JSON content if it's a stringified JSON and skip the first response
        const parsedChatHistory = intent_response.chat_history.slice(1).map(item => {
          try {
            const parsedContent = JSON.parse(item.content);
            return {
              ...item,
              content: parsedContent.response,
              intent: parsedContent.intent
            };
          } catch (e) {
            return item;
          }
        });
  
      setChatHistory(parsedChatHistory);

    } catch (error) {
      alert("Error: " + error.message);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current.click()
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
  
    if (!file) return;
  
    console.log('Selected file:', file);
  
    const formData = new FormData();
    formData.append('image', file);
  
    try {
      const response = await fetch("http://127.0.0.1:5000/upload-image", {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${idToken}`,
        },
        body: formData,
      });
  
      if (response.ok) {
        const data = await response.json();
        console.log('File uploaded successfully:', data);
        alert('File uploaded successfully!');
        // Handle the response as needed
      } else {
        const errorData = await response.json();
        console.error('Error uploading file:', errorData);
        alert('Error uploading file: ' + errorData.error);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error: ' + error.message);
    }
  };

  return (
    <div className="d-flex" style={{ height: '100vh', overflow: 'hidden' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <HomeNavBar />

    <div className="flex-grow-1 mt-5" style={{ maxHeight: maxScrollHeight, overflowY: 'auto' }}>
      {chatHistory.map((message, index) => (
        <Container fluid key={index}>
          <Row className="justify-content-center">
            <Col xs={12} md={10} lg={8} xl={10}>
              <div className="border rounded p-4 mb-3 d-flex align-items-center">
                {message.role === 'user' ? (
                  <div className="me-4">
                    <FontAwesomeIcon icon={faUser} style={{ fontSize: '24px', color: 'black' }} />
                  </div>
                ) : (
                  <div className="me-4">
                    <FontAwesomeIcon icon={faMicrochip} style={{ fontSize: '24px', color: 'black' }} />
                  </div>
                )}
                <div>
                  <p className={message.role}>
                    {message.role}
                  </p>
                  <p>
                    {message.content}
                  </p>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      ))}
    </div>

    {/* <div>
      {user ? (
        <div>
          <p>Welcome, {user.email}</p>
          <p>Token, {idToken}</p>
          <button onClick={logout}>Logout</button>
        </div>
      ) : (
        <p>Please sign in to access data.</p>
      )}
    </div> */}

        <div className="input-container">
          <Container fluid className="mt-0">
            <Row className="justify-content-center">
              <Col xs={12} md={10} lg={8} xl={10} className="text-center">
                <div className="border p-4">
                  <form onSubmit={handleChat}>
                    <div className="d-flex mb-3">
                    <button
                        type="button"
                        className="btn btn-outline-secondary rounded-circle me-2"
                        onClick={handleUploadClick}
                        style={{
                          width: '3em',
                          height: '3em',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '0',
                          backgroundColor: 'white',
                          border: '1px solid black',
                          color: 'black',
                        }}
                      >
                        <FontAwesomeIcon icon={faImage} style={{ fontSize: '1.5em', color: 'black' }} />
                      </button>
                      <input
                        type="file"
                        ref={fileInputRef} 
                        style={{ display: 'none' }}
                        onChange={handleFileChange}
                      />
                      <textarea
                        className="form-control"
                        rows="2"
                        placeholder="Write more than one line here"
                        aria-label="Message"
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        style={{
                          flex: 1,
                          resize: 'none',
                          paddingRight: '3em',
                        }}
                      ></textarea>
                      <button
                        className="btn btn-outline-secondary rounded-circle ms-2"
                        type="submit"
                        style={{
                          width: '3em',
                          height: '3em',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '0',
                          backgroundColor: 'white',
                          border: '1px solid black',
                          color: 'black',
                        }}
                      >
                        <FontAwesomeIcon icon={faArrowUp} style={{ fontSize: '1.5em', color: 'black' }} />
                      </button>
                    </div>
                  </form>
                </div>
              </Col>
            </Row>
          </Container>
        </div>
      </div>
    </div>
  );
};

export default Home;
