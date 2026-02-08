import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="header">
      <div className="header__inner">
        <a className="header__logo" href="/" aria-label="zur Homepage">
          <img src="/templates/ingdiba/images/logo.svg" alt="ING Logo" style={{ width: '120px', height: 'auto' }} />
        </a>
      </div>
    </header>
  );
};

export default Header;