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
import * as XLSX from 'xlsx';

Exporting(Highcharts);
ExportData(Highcharts);
FullScreen(Highcharts);
NoDataToDisplay(Highcharts);

const createChartOptions = (title, data) => {
  // Parse keys to integers for proper numerical sorting
  const sortedKeys = Object.keys(data).map(key => parseInt(key, 10)).sort((a, b) => a - b);

  return {
    chart: {
      type: 'column'
    },
    title: {
      text: title,
      useHTML: true
    },
    xAxis: {
      title: {
        text: ''
      },
      categories: sortedKeys
    },
    yAxis: {
      title: {
        text: ''
      },
      tickInterval: 5,
      min: 0,
      max: 60,
      gridLineWidth: 0
    },
    plotOptions: {
      column: {
        dataLabels: {
          enabled: true,
          format: '{point.y}'
        }
      }
    },
    colors: [
      '#5A72A0'
    ],
    series: [{
      name: 'Count of cases',
      data: sortedKeys.map(key => data[key])
    }],
    credits: {
      enabled: false
    },
    exporting: {
      enabled: true,
      buttons: {
        contextButton: {
          menuItems: [
            'viewFullscreen',
            'printChart',
            'separator',
            'downloadPNG',
            'downloadJPEG',
            'downloadPDF',
            'downloadSVG',
            'separator',
            'downloadXLS',
            {
              text: 'Download XLSX',
              onclick: function () {
                const chartData = this.series.map(series => {
                  return [series.name, ...series.data.map(point => point.y)];
                });
                const ws = XLSX.utils.aoa_to_sheet([
                  ['Category', ...this.xAxis[0].categories],
                  ...chartData
                ]);
                const wb = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
                XLSX.writeFile(wb, 'chart-data.xlsx');
              }
            },
            {
              text: 'Download ODS',
              onclick: function () {
                const chartData = this.series.map(series => {
                  return [series.name, ...series.data.map(point => point.y)];
                });
                const ws = XLSX.utils.aoa_to_sheet([
                  ['Category', ...this.xAxis[0].categories],
                  ...chartData
                ]);
                const wb = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
                XLSX.writeFile(wb, 'chart-data.ods');
              }
            }
          ]
        }
      }
    },
    lang: {
      noData: "No data available currently"
    },
    noData: {
      style: {
        fontWeight: 'bold',
        fontSize: '15px',
        color: '#303030',
        fontFamily: 'Manrope'
      }
    }
  };
};

function AefiCasesByIntervalTwo() {
  const [loading, setLoading] = useState(false);
  const [chartData, setChartData] = useState(null);
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
        console.log('Response Data:', response.data[selectedCountry]);
        setChartData(response.data[selectedCountry]["AEFI Cases by Interval of Date of Onset and Date of Report (# of days)"]);
      }
    } catch (error) {
      setLoading(false);
      console.error('Error:', error);
    }
  };

  if (loading) return <div>Loading...</div>;

  if (!chartData || Object.keys(chartData).length === 0) {
    return <HighchartsReact
      highcharts={Highcharts}
      options={createChartOptions("AEFI Cases by Interval of Date of Onset and <br> Date of Report (# of days)", {})}
    />;
  }

  return (
    <HighchartsReact
      highcharts={Highcharts}
      options={createChartOptions("AEFI Cases by Interval of Date of Onset and <br> Date of Report (# of days)", chartData)}
    />
  );
}

export default AefiCasesByIntervalTwo;
