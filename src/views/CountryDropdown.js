import React, { useContext, useEffect, useState } from 'react';
import Select from 'react-select';
import { CountryContext } from './CountryContext';
import axios from 'axios';

const CountryDropdown = () => {
  const { selectedCountry, setSelectedCountry } = useContext(CountryContext);
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

export default CountryDropdown;
