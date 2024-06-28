import React, { useEffect, useState, useContext } from "react";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import { Card, Button, Col, Navbar } from "react-bootstrap";
import Row from "react-bootstrap/Row";
import axios from 'axios';
import "./style.css";
import "./variable.css";
import 'bootstrap/dist/css/bootstrap.min.css';
import imgurl from "./imageurl";
import AefiCasesByProvince from "./views/AefiCasesByProvince";
import AefiCasesByDIstrict from "./views/AefiCasesByDistrict";
import AefiCasesByHealthFacility from "./views/AefiCasesByHealthFacility";
import AefiCasesAtNationalLevel from "./views/AefiCasesAtNationalLevel";
import AefiCasesByAge from "./views/AefiCasesByAge";
import AefiCasesBySex from "./views/AefiCasesBySex";
import AefiCasesByEvent from "./views/AefiCasesByEvent";
import UploadPage from "./views/UploadFiles";
import { CountryProvider, CountryContext } from './views/CountryContext';
import { List } from 'react-bootstrap-icons';
import Select from 'react-select';
import AefiCasesByVaccine from "./views/AefiCasesByVaccine";
import ReasonForSerious from "./views/ReasonForSerious";
import AefiSeriousEvent from "./views/AefiSeriousEvent";
import AefiCasesByIntervalTwo from "./views/AefiCasesByIntervalTwo";
import AefiCasesByInterval from "./views/AefiCasesByInterval";
import TotalCases from "./views/TotalCases";

const CountryLogo = () => {
  const { selectedCountry } = useContext(CountryContext);

  switch (selectedCountry) {
    case 'Harmonia':
      return null;
    case 'Jordan':
      return <img src={imgurl.jordanlogo} className="mx-5 main-logo" alt="logo" />;
    default:
      return null;
  }
};

const CountryDropdown = ({ options }) => {
  const { selectedCountry, setSelectedCountry } = useContext(CountryContext);

  const handleChange = (selectedOption) => {
    setSelectedCountry(selectedOption.value);
  };

  return (
    <Select
      options={options}
      value={options.find(option => option.value === selectedCountry)}
      onChange={handleChange}
      isSearchable={false}
      defaultValue={options.find(option => option.value === 'Harmonia')}
    />
  );
};

function App() {
  const [options, setOptions] = useState([]);

  useEffect(() => {
    axios.get('https://vigiflow.duredemos.com/service/vigiflow/charts/getActiveCountries')
      .then(response => {
        const countryOptions = response.data.map(country => ({
          value: country.countryName,
          label: country.countryName
        }));
        setOptions(countryOptions);
      })
      .catch(error => {
        console.error("Error fetching countries:", error);
      });
  }, []);

  return (
    <CountryProvider>
      <Router basename="/dashboard">
        <Routes>
          <Route path="/upload" element={<UploadPage options={options} />} />
          <Route
            path="/"
            element={
              <div className="openDashboard-section">
                <Navbar sticky="top" expand="lg" style={{ backgroundColor: "#fff" }}>
                  <Row className="w-100 d-flex justify-content-center align-items-center">
                    <Col xs={3} lg={4} sm={2} md={2}>
                      <CountryLogo />
                    </Col>
                    <Col xs={7} lg={4} sm={8} md={8} className="main-center" style={{ fontFamily: 'Manrope' }}>
                      <p className="mb-0 heading-div">AEFI VigiFlow Dashboard</p>
                    </Col>
                    <Col xs={2} lg={4} sm={2} md={2} className="d-flex justify-content-end">
                      <Navbar.Toggle aria-controls="basic-navbar-nav">
                        <List />
                      </Navbar.Toggle>
                      <Navbar.Collapse id="basic-navbar-nav">
                        <div className="ml-auto d-lg-flex align-items-lg-center" style={{ fontFamily: 'Manrope' }}>
                          <CountryDropdown options={options} />
                          <div className="filter-button">
                            <Button as={Link} to="/upload" className="openbtn">
                              <span>Data Management</span>
                            </Button>
                          </div>
                        </div>
                      </Navbar.Collapse>
                    </Col>
                  </Row>
                </Navbar>
                <div className="p-20px">
                  <div className="chart-section">
                    <Row>
                      <Col lg={12}>
                        <Card>
                          <Card.Body className="pb-3">
                            <TotalCases />
                          </Card.Body>
                        </Card>
                      </Col>
                    </Row>
                    <Row>
                      <Col lg={4}>
                        <Card>
                          <Card.Body className="pb-3">
                            <AefiCasesAtNationalLevel />
                          </Card.Body>
                        </Card>
                      </Col>
                      <Col lg={4}>
                        <Card>
                          <Card.Body className="pb-3">
                            <AefiCasesByProvince />
                          </Card.Body>
                        </Card>
                      </Col>
                      <Col lg={4}>
                        <Card>
                          <Card.Body className="pb-3">
                            <AefiCasesByDIstrict />
                          </Card.Body>
                        </Card>
                      </Col>
                    </Row>
                    <Row className="pie-chart">
                      <Col lg={12}>
                        <Card>
                          <Card.Body className="pb-3">
                            <AefiCasesByHealthFacility />
                          </Card.Body>
                        </Card>
                      </Col>
                    </Row>
                    <Row>
                      <Col lg={6}>
                        <Card>
                          <Card.Body className="pb-3">
                            <AefiCasesByAge />
                          </Card.Body>
                        </Card>
                      </Col>
                      <Col lg={6}>
                        <Card>
                          <Card.Body className="pb-3">
                            <AefiCasesBySex />
                          </Card.Body>
                        </Card>
                      </Col>
                    </Row>
                    <Row>
                      <Col lg={12}>
                        <Card>
                          <Card.Body className="pb-3">
                            <AefiCasesByEvent />
                          </Card.Body>
                        </Card>
                      </Col>
                    </Row>
                    <Row>
                      <Col lg={6}>
                        <Card>
                          <Card.Body className="pb-3">
                            <AefiCasesByVaccine />
                          </Card.Body>
                        </Card>
                      </Col>
                      <Col lg={6}>
                        <Card>
                          <Card.Body className="pb-3">
                            <AefiSeriousEvent />
                          </Card.Body>
                        </Card>
                      </Col>
                    </Row>
                    <Row>
                      <Col lg={12}>
                        <Card>
                          <Card.Body className="pb-3">
                          <ReasonForSerious />
                          </Card.Body>
                        </Card>
                      </Col>
                    </Row>
                    <Row>
                      <Col lg={6}>
                        <Card>
                          <Card.Body className="pb-3">
                            <AefiCasesByInterval />
                          </Card.Body>
                        </Card>
                      </Col>
                      <Col lg={6}>
                        <Card>
                          <Card.Body className="pb-3">
                            <AefiCasesByIntervalTwo />
                          </Card.Body>
                        </Card>
                      </Col>
                    </Row>
                  </div>
                </div>
              </div>
            }
          />
        </Routes>
      </Router>
    </CountryProvider>
  );
}

export default App;
