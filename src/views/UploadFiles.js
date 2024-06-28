import React, { useEffect, useState, useContext } from "react";
import { Navbar, Form, Button, Container, Alert, Row, Col, Card, Modal, Nav, ListGroup } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { AiOutlineHome } from 'react-icons/ai';
import Select from 'react-select';
import axios from 'axios';
import { CountryContext } from './CountryContext';  // Import CountryContext
import "../style.css";
import "../variable.css";
import 'bootstrap/dist/css/bootstrap.min.css';
import { MdFileDownload } from "react-icons/md";

const UploadPage = ({ options }) => {
  const [file1, setFile1] = useState(null);
  const [uploadError, setUploadError] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [historyError, setHistoryError] = useState("");
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const [selectedCountryForUpload, setSelectedCountryForUpload] = useState(null);
  const [selectedCountryForDelete, setSelectedCountryForDelete] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [activeTab, setActiveTab] = useState('upload');
  const [isLoading, setIsLoading] = useState(false); // State for loader
  const navigate = useNavigate();
  const [savedData, setSavedData] = useState(null);
  const [latestUploadsData, setLatestUploadsData] = useState([]);

  useEffect(() => {
    fetchSavedData();
    fetchLatestUploads();
  }, []);

  const fetchSavedData = async () => {
    try {
      const response = await axios.get("https://vigiflow.duredemos.com/service/vigiflow/charts/getActiveCountries");
      if (response.status === 200) {
        setSavedData(response.data);
      }
    } catch (error) {
      console.error('Error fetching saved data:', error);
    }
  };

  const fetchLatestUploads = async () => {
    try {
      const response = await axios.get('https://vigiflow.duredemos.com/service/vigiflow/excel/getUploadHistory');
      if (response.status === 200) {
        setLatestUploadsData(response.data);
      }
    } catch (error) {
      console.error('Error fetching latest uploads:', error);
    }
  };

  const { setSelectedCountry } = useContext(CountryContext);  // Destructure setSelectedCountry from CountryContext

  const customStyles = {
    control: (provided) => ({
      ...provided,
      backgroundColor: 'white',
      borderRadius: '8px',
      border: '1px solid #ced4da',
      boxShadow: 'none',
      '&:hover': {
        borderColor: '#80bdff'
      }
    }),
    menu: (provided) => ({
      ...provided,
      borderRadius: '8px',
      border: '1px solid #ced4da',
      boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected ? '#e9ecef' : 'white',
      color: state.isSelected ? '#495057' : '#495057',
      '&:hover': {
        backgroundColor: '#f8f9fa',
        color: '#495057'
      }
    })
  };

  const validateFile = (file) => {
    const validExtensions = ['xlsx', 'xls', 'ods'];
    const fileExtension = file.name.split('.').pop().toLowerCase();
    return validExtensions.includes(fileExtension);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && validateFile(file)) {
      setFile1(file);
      setUploadError("");
    } else {
      setFile1(null);
      setUploadError("Only XLSX, XLS, ODS files are supported.");
    }
  };

  const handleUploadSubmit = async () => {
    if (!selectedCountryForUpload) {
        setUploadError("Please select a country.");
        setTimeout(() => {
            setUploadError("");
        }, 5000);
        return;
    }

    if (file1) {
        setIsLoading(true);

        try {
            const formData = new FormData();
            formData.append('file', file1);
            formData.append('countryName', selectedCountryForUpload.value);

            const response = await axios.post('https://vigiflow.duredemos.com/service/vigiflow/excel/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.data.success === true) {
                setUploadSuccess(true);
                setTimeout(() => {
                    setUploadSuccess(false);
                    setSelectedCountry(selectedCountryForUpload.value);
                    navigate("/");
                }, 3000);
            } else {
                // This block might never be reached if the server returns a 400 status
                setUploadError(response.data.errors.join('\n'));
                setTimeout(() => {
                    setUploadError("");
                }, 5000);
                console.log(response.data.errors.join('\n'));
            }
        } catch (error) {
            setIsLoading(false);
            if (error.response && error.response.data.success === false) {
                // Accessing the error message returned from the server
                const errorMessage = error.response.data.errors.join('\n');
                setUploadError(errorMessage);
                console.error('Error response:', error.response.data);
            } else if (error.request) {
                // No response received from the server
                setUploadError("No response from server. Please try again.");
                console.error('Error request:', error.request);
            } else {
                // Other errors
                setUploadError("Error uploading file. Please try again.");
                console.error('Error message:', error.message);
            }
            setUploadSuccess(false);
            setTimeout(() => {
                setUploadError("");
            }, 5000);
        }
    } else {
        setUploadError("Please upload the file.");
        setTimeout(() => {
            setUploadError("");
        }, 5000);
    }
};


  const handleClearButtonClick = () => {
    if (!selectedCountryForDelete) {
      setDeleteError("Please select a country.");
      setTimeout(() => {
        setDeleteError("");
      }, 5000); // Display error message for 5 seconds
      return;
    }
    setShowDeleteModal(true);
  };

  const handleDeleteSubmit = async () => {
    setIsLoading(true); // Show loader

    try {
      const matchedCountry = savedData.find(country => country.countryName === selectedCountryForDelete.value) || {};
      const response = await axios.post("https://vigiflow.duredemos.com/service/vigiflow/excel/deleteAllDataForCountry", {
        "countryId": matchedCountry.countryId,
        "countryName": matchedCountry.countryName
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      setIsLoading(false);

      setDeleteSuccess(true);
      setShowDeleteModal(false);
      setTimeout(() => {
        setDeleteSuccess(false);
        setSelectedCountry(selectedCountryForDelete.value);  // Update selected country
      }, 3000); //Success message time
    } catch (error) {
      setDeleteError("Error deleting data. Please try again.");
      setDeleteSuccess(false);
      setIsLoading(false); // Hide loader
    }
  };

  const handleDownload = async (fileName) => {
    setIsLoading(true);
  
    try {
      const history = latestUploadsData.find(uploadHistory => uploadHistory.fileName === fileName);
  
      if (history) {
        const response = await axios.get(
          `https://vigiflow.duredemos.com/service/vigiflow/excel/download/${history.id}`,
          { responseType: 'blob' }
        );

        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${fileName}`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        setHistoryError(`File not found for fileName: ${fileName}`);
        setTimeout(() => {
          setHistoryError("");
      }, 3000);
      }

      setIsLoading(false);
    } catch (error) {
      setHistoryError('Error downloading file.');
      setTimeout(() => {
        setHistoryError("");
    }, 3000);
      setIsLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getUTCDate()).padStart(2, '0');
    const month = String(date.getUTCMonth() + 1).padStart(2, '0'); // Months are zero-indexed
    const year = date.getUTCFullYear();
    return `${day}/${month}/${year}`;
  };

  return (
    <div className="openDashboard-section">
      {/* Loader */}
      {isLoading && (
        <div className="loader-overlay">
          <div className="loader"></div>
        </div>
      )}

      <Navbar sticky="top" style={{ backgroundColor: "#fff" }}>
        <Row className="w-100 d-flex justify-content-center align-items-center">
          <Col xs={2} lg={2} sm={2} md={2}>
            <Button variant="link" onClick={() => navigate("/")} className="btn-icon">
              <AiOutlineHome style={{ color: "black", fontSize: "1.5em" }} />
            </Button>
          </Col>
          <Col xs={10} lg={9} sm={10} md={10} className="main-center">
            <p className="mb-0 heading-div" style={{ color: "white", fontSize: "1.25em", fontFamily: 'Manrope' }}>
              AEFI VigiFlow Dashboard
            </p>
          </Col>
          <Col lg={1}></Col>
        </Row>
      </Navbar>

      <Container className="mt-4 upload_page">
        <Row className="justify-content-center">
          <Col md={8}>
            <h3 className="mb-4">Data Management</h3>
            <Nav variant="tabs" activeKey={activeTab} onSelect={(selectedKey) => setActiveTab(selectedKey)}>
              <Nav.Item>
                <Nav.Link eventKey="upload">Upload Data</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="delete">Clear Data</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="latest">Upload History</Nav.Link>
              </Nav.Item>
            </Nav>
          </Col>
        </Row>

        {activeTab === 'upload' && (
          <Row className="justify-content-center mt-4">
            <Col md={8}>
              {uploadError && (
                <Alert variant="danger">
                  <div dangerouslySetInnerHTML={{ __html: uploadError.replace(/\n/g, '<br>') }} />
                </Alert>
              )}
              {uploadSuccess && <Alert variant="success">File submitted successfully!</Alert>}
              <Card>
                <Card.Body>
                  <Form>
                    <h4 className="mb-4">Upload your file</h4>
                    <Form.Group controlId="formSelect">
                      <Form.Label>Select Country</Form.Label>
                      <Select
                        options={options}
                        styles={customStyles}
                        onChange={setSelectedCountryForUpload}
                      />
                    </Form.Group>
                    <Form.Group controlId="formFile1" className="mt-4">
                      <Form.Label>Choose File</Form.Label>
                      <Form.Control
                        type="file"
                        accept=".xlsx,.xls,.ods"
                        onChange={handleFileChange}
                        style={{ padding: '10px', borderRadius: '8px' }}
                      />
                    </Form.Group>
                    <Button variant="primary" onClick={handleUploadSubmit} className="mt-4" style={{ borderRadius: '8px', padding: '10px 20px', width: '100%' }}>
                      Submit Data
                    </Button>
                  </Form>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        )}

        {activeTab === 'delete' && (
          <Row className="justify-content-center mt-4">
            <Col md={8}>
              {deleteError && <Alert variant="danger">{deleteError}</Alert>}
              {deleteSuccess && <Alert variant="success">Data cleared successfully!</Alert>}
              <Card>
                <Card.Body>
                  <Form>
                    <h4 className="mb-4">Clear data</h4>
                    <Form.Group controlId="formSelect">
                      <Form.Label>Select Country</Form.Label>
                      <Select
                        options={options}
                        styles={customStyles}
                        onChange={setSelectedCountryForDelete}
                      />
                    </Form.Group>
                    <Button variant="danger" onClick={handleClearButtonClick} className="mt-4" style={{ borderRadius: '8px', padding: '10px 20px', width: '100%' }}>
                      Clear Data
                    </Button>
                  </Form>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        )}

        {activeTab === 'latest' && (
          <Row className="justify-content-center mt-4">
            <Col md={8}>
              {historyError && <Alert variant="danger">{historyError}</Alert>}
              <div className="scrollable-content">
                <ListGroup>
                  {latestUploadsData.map(history => (
                    <ListGroup.Item key={history.id} className="d-flex justify-content-between align-items-center">
                      <div>
                        <span>{history.fileName}</span><br />
                        <small>{formatDate(history.uploadDate)}</small>
                      </div>
                      <Button variant="" onClick={() => handleDownload(history.fileName)}>
                        <MdFileDownload size={24} color="grey"/>
                      </Button>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              </div>
            </Col>
          </Row>
        )}
      </Container>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered className="custom-modal">
        <Modal.Header closeButton>
          <Modal.Title>Confirm Data Clear</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to clear the data?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            No
          </Button>
          <Button variant="danger" onClick={handleDeleteSubmit}>
            Yes
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default UploadPage;
