import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="footer mt-auto py-3 bg-light">
      <div className="container">
        <div className="row">
          <div className="col-md-4">
            <h5>Resources</h5>
            <ul className="list-unstyled">
              <li><Link to="/about">About</Link></li>
              
            </ul>
          </div>
          <div className="col-md-4">
            <h5>More</h5>
            <ul className="list-unstyled">
              <li><Link to="/contact">Contact</Link></li>
              <li><a href="https://twitter.com" target="_blank" rel="noopener noreferrer">Twitter</a></li>
            </ul>
          </div>
          <div className="col-md-4">
            <h5>Legal</h5>
            <ul className="list-unstyled">
              <li><Link to="/terms">Terms of Use</Link></li>
              <li><Link to="/privacy">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>
      </div>
      <div className="container text-center">
        <hr />
        <p>© {new Date().getFullYear()} Voice Clinic. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
