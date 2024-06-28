// CountryContext.js
import React, { createContext, useState } from 'react';

// Create the context
export const CountryContext = createContext();

// Create the provider component
export const CountryProvider = ({ children }) => {
  const [selectedCountry, setSelectedCountry] = useState('Harmonia');

  return (
    <CountryContext.Provider value={{ selectedCountry, setSelectedCountry }}>
      {children}
    </CountryContext.Provider>
  );
};