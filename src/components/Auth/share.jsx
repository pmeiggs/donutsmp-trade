import React, { useState } from 'react';
import './Share.css';

const Share = () => {
  const [title, setTitle] = useState('');
  const [photo, setPhoto] = useState('');
  const [content, setContent] = useState('');

  return (
    <div className="share-container mt-5">
      <div className="container">
        <h2 className="display-5 fw-bold mb-4 text-white">SHARE YOUR STORY</h2>
        
        <div className="share-card shadow-lg">
          <form action="/post" method="POST">
            <div className="row g-0">
              
              <div className="col-lg-7 p-4 p-md-5">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <span className="badge bg-primary px-3 py-2">New Post</span>
                  <div className="dropdown">
                    <button className="btn btn-link text-dark p-0" type="button" data-bs-toggle="dropdown">
                      <i className="bi bi-three-dots fs-4"></i>
                    </button>
                    <ul className="dropdown-menu">
                      <li><button className="dropdown-item" type="button">Drafts</button></li>
                      <li><button className="dropdown-item" type="button">Privacy Settings</button></li>
                    </ul>
                  </div>
                </div>

                <input 
                  className="form-control form-control-lg custom-input mb-3" 
                  type="text" 
                  placeholder="Title" 
                  name="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required 
                />

                <input 
                  className="form-control custom-input mb-3" 
                  type="text" 
                  placeholder="Paste Image URL (Photo link)" 
                  name="photo"
                  value={photo}
                  onChange={(e) => setPhoto(e.target.value)}
                />

                <textarea 
                  className="form-control custom-input mb-4" 
                  placeholder="Tell your story..." 
                  name="content"
                  style={{ height: '250px' }}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  required
                ></textarea>

                <div className="d-flex justify-content-end gap-2">
                  <a href="/main" className="btn btn-light px-4">Cancel</a>
                  <button type="submit" className="btn btn-primary px-5 shadow-sm">Post Now</button>
                </div>
              </div>

              <div className="col-lg-5 d-none d-lg-flex bg-preview align-items-center justify-content-center p-4">
                {photo ? (
                  <div className="preview-wrapper">
                    <p className="small text-muted text-center mb-2">Image Preview</p>
                    <img src={photo} alt="Preview" className="img-fluid rounded shadow" />
                  </div>
                ) : (
                  <div className="text-center text-muted">
                    <i className="bi bi-image fs-1 d-block mb-2"></i>
                    <p>Image preview will appear here</p>
                  </div>
                )}
              </div>

            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Share;