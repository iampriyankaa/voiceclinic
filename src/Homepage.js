import React from 'react';
import { Link } from 'react-router-dom';

function Homepage() {
  return (
    <div className="homepage">
      <section className="home text-center">
        <div className="container">
          <h1 className="display-4">REAL SPEAK</h1>
          <p className="lead">Secure Voice Clinic </p>
          <Link to="/login" className="btn btn-danger btn-lg">RECORD</Link>
        </div>
      </section>
      <br/>
      
      <section className="hero">
       
      </section>
      <section className="testimonials">
        <div className="container">
          <h2 className="mb-5 text-center">TESTIMONIALS</h2>
          <div className="row">
            <div className="col-md-4">
              <div className="card">
                <div className="card-body">
                  <blockquote className="blockquote mb-0">
                    <p>"A terrific piece of praise"</p>
                    <footer className="blockquote-footer">Name <cite title="Source Title">Description</cite></footer>
                  </blockquote>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card">
                <div className="card-body">
                  <blockquote className="blockquote mb-0">
                    <p>"A fantastic bit of feedback"</p>
                    <footer className="blockquote-footer">Name <cite title="Source Title">Description</cite></footer>
                  </blockquote>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card">
                <div className="card-body">
                  <blockquote className="blockquote mb-0">
                    <p>"A genuinely glowing review"</p>
                    <footer className="blockquote-footer">Name <cite title="Source Title">Description</cite></footer>
                  </blockquote>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Homepage;
