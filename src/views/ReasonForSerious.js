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

    const sortedKeys = Object.keys(data).sort((a, b) => a.localeCompare(b));

    return {
    chart: {
      type: 'column'
    },
    title: {
      text: title,
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
      tickInterval: 10,
      min: 0,
      max: 100,
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
       '#80B9AD'
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
   }
  };

function ReasonForSerious() {
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
        setChartData(response.data[selectedCountry]["Reason for Serious"]);
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
      options={createChartOptions("Reason for Serious", {})}
    />;
  }

  return (
    <HighchartsReact
      highcharts={Highcharts}
      options={createChartOptions("Reason for Serious", chartData)}
    />
  );
}

export default ReasonForSerious;
