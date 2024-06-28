import React, { useState, useEffect, useContext } from "react";
// import * as URL from "../urls";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import axios from 'axios';
import Exporting from 'highcharts/modules/exporting';
import ExportData from 'highcharts/modules/export-data';
import FullScreen from 'highcharts/modules/full-screen';
import NoDataToDisplay from 'highcharts/modules/no-data-to-display';
import { CountryContext } from './CountryContext';
import { Card, Button, Col, Navbar } from "react-bootstrap";
import Row from "react-bootstrap/Row";

Exporting(Highcharts);
ExportData(Highcharts);
FullScreen(Highcharts);
NoDataToDisplay(Highcharts);

function TotalCases() {
  const [loading, setLoading] = useState(false);
  const [totalCases, setTotalCases] = useState('0');
  const [savedData, setSavedData] = useState(null); // State to save data from data4.json
  const { selectedCountry } = useContext(CountryContext);

  useEffect(() => {
    fetchSavedData();
  }, []);

  useEffect(() => {
    if (savedData) {
      getAllChartsData();
    }
  }, [selectedCountry, savedData]);

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

  const getAllChartsData = async () => {
    setLoading(true);
    try {
      const matchedCountry = savedData.find(country => country.countryName === selectedCountry) || {};
      console.log(matchedCountry);
      const response = await axios.post("https://vigiflow.duredemos.com/service/vigiflow/charts/getChartData", {
        "countryId": matchedCountry.countryId,
        "countryName": matchedCountry.countryName
      });
      setLoading(false);
      if (response.status === 200) {
        console.log('Response Data:', response.data);
        const casesData = response.data[selectedCountry]["AEFI cases at the National Level"];
        const numberOfCases = casesData[selectedCountry];
        setTotalCases([numberOfCases]);
      }
    } catch (error) {
      setLoading(false);
      console.error('Error:', error);
    }
  };
  console.log(totalCases);
  return (
        <h5>Total Cases : {totalCases}</h5>
  );
}

export default TotalCases;
