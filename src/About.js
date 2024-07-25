import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMicrophone, faLock, faCode, faShieldAlt, faDesktop } from '@fortawesome/free-solid-svg-icons';
import './About.css'; 

const About = () => {
    return (
        <div className="container mt-5">
            <div className="row">
                <div className="col-md-8 offset-md-2">
                    <h1 className="text-center mb-4">About Voice Clinic</h1>
                    <p className="lead text-center">
                        Welcome to Voice Clinic, your secure platform for voice management and improvement in healthcare.
                    </p>
                    <div className="text-center mt-5">
                        <a href="/register" className="btn btn-primary btn-lg btn-register">Register</a>
                    </div>
                    <div className="row mt-5">
                        <div className="col-md-4 mb-4">
                            <div className="text-center">
                                <FontAwesomeIcon icon={faMicrophone} size="3x" className="mb-3 text-primary" />
                                <h4>Voice Recording</h4>
                                <p>Record your voice securely for medical communication.</p>
                            </div>
                        </div>
                        <div className="col-md-4 mb-4">
                            <div className="text-center">
                                <FontAwesomeIcon icon={faLock} size="3x" className="mb-3 text-primary" />
                                <h4>Secure Communication</h4>
                                <p>Ensure HIPAA-compliant secure voice messaging.</p>
                            </div>
                        </div>
                        <div className="col-md-4 mb-4">
                            <div className="text-center">
                                <FontAwesomeIcon icon={faCode} size="3x" className="mb-3 text-primary" />
                                <h4>Technological Integration</h4>
                                <p>Utilize cutting-edge technology for seamless integration.</p>
                            </div>
                        </div>
                        <div className="col-md-4 mb-4">
                            <div className="text-center">
                                <FontAwesomeIcon icon={faShieldAlt} size="3x" className="mb-3 text-primary" />
                                <h4>Data Security</h4>
                                <p>Protect sensitive medical information with advanced encryption.</p>
                            </div>
                        </div>
                        <div className="col-md-4 mb-4">
                            <div className="text-center">
                                <FontAwesomeIcon icon={faDesktop} size="3x" className="mb-3 text-primary" />
                                <h4>Web-Based Platform</h4>
                                <p>Access voice messaging from any web-enabled device.</p>
                            </div>
                        </div>
                    </div>
                   
                </div>
            </div>
        </div>
    );
}

export default About;
