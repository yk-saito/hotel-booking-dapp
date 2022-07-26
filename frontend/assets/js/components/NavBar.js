import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import NavDropdown from "react-bootstrap/NavDropdown";
import Button from "react-bootstrap/Button";

import { login, logout, accountBalance } from "../near/utils";

const NavBar = () => {
  // const account = window.walletConnection.account();
  const navigate = useNavigate();
  const [balance, setBalance] = useState("0");

  const getBalance = async () => {
    if (window.accountId) {
      setBalance(await accountBalance());
    }
  };

  useEffect(() => {
    getBalance();
  });

  // if (!window.walletConnection.isSignedIn()) {
  return (
    <Navbar collapseOnSelect expand='lg' bg='dark' variant='dark'>
      <Container>
        <Navbar.Brand href='#home'>HOTEL BOOKING</Navbar.Brand>
        <Navbar.Toggle aria-controls='responsive-navbar-nav' />
        <Navbar.Collapse id='responsive-navbar-nav'>
          <Nav className='me-auto'></Nav>
          <Nav>
            {!window.accountId && (
              <Button onClick={login} variant='outline-light'>
                Connect Wallet
              </Button>
            )}
            {window.accountId && (
              <>
                {/* NEAR Wallet */}
                <NavDropdown
                  title={`${balance} NEAR`}
                  id='collasible-nav-dropdown'
                >
                  {/* To explorer */}
                  <NavDropdown.Item
                    href={`https://explorer.testnet.near.org/accounts/${window.accountId}`}
                  >
                    {window.accountId}
                  </NavDropdown.Item>
                  <NavDropdown.Divider />
                  <NavDropdown.Item
                    onClick={() => {
                      logout();
                    }}
                  >
                    Disconnect
                  </NavDropdown.Item>
                </NavDropdown>
                <NavDropdown title='Dropdown' id='collasible-nav-dropdown'>
                  <NavDropdown.Item
                    onClick={() =>
                      navigate(`/room-management/${window.accountId}`)
                    }
                  >
                    Booked room
                  </NavDropdown.Item>
                  <NavDropdown.Item href='#action/3.2'>
                    Another action
                  </NavDropdown.Item>
                  <NavDropdown.Item href='#action/3.3'>
                    Something
                  </NavDropdown.Item>
                  <NavDropdown.Divider />
                  <NavDropdown.Item href='#action/3.4'>
                    Separated link
                  </NavDropdown.Item>
                </NavDropdown>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavBar;
