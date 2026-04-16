import React from 'react';
import FooterPrimary from '../Footer/FooterPrimary';
import FooterSecondary from '../Footer/FooterSecondary';
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
