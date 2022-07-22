import React from "react";
import { useNavigate } from "react-router-dom";

const Wallet = ({ address, amount, symbol, destroy }) => {
  if (address) {
    const navigate = useNavigate();
    return (
      <div className='dropdown'>
        <button
          className='d-flex align-items-center border rounded-pill py-1 dropdown-toggle'
          id='dropdownMenuButton1'
          data-bs-toggle='dropdown'
        >
          {amount} <span className='ms-1'> {symbol}</span>
        </button>
        <ul className='dropdown-menu' aria-labelledby='dropdownMenuButton1'>
          {/* Show accountID */}
          <li>
            <a
              className='dropdown-item bi bi-person-circle fs-4'
              href={`https://explorer.testnet.near.org/accounts/${address}`}
            >
              <span className='font-monospace'>{address}</span>
            </a>
          </li>
          {/* Show Booking list */}
          <li>
            <button
              className='dropdown-item bi bi-check-lg me-2 fs-4'
              onClick={() => navigate("/booked")}
            >
              Booked
            </button>
          </li>
          <li className='dropdown-divider'></li>
          {/* Show Destroy button */}
          <li>
            <button
              className='dropdown-item bi bi-box-arrow-right me-2 fs-4'
              onClick={() => {
                destroy();
              }}
            >
              Disconnect
            </button>
          </li>
        </ul>
      </div>
    );
  }

  return null;
};

export default Wallet;
