import React from 'react';
import FooterPrimary from './FooterPrimary';
import FooterSecondary from './FooterSecondary';
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
