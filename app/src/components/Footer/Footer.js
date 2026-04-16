import React from 'react';
import FooterPrimary from '../footer/FooterPrimary';
import FooterSecondary from '../footer/FooterSecondary';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="app-footer">
      <FooterPrimary />
      <FooterSecondary />
    </footer>
  );
};

export default Footer;
