import "regenerator-runtime/runtime";
import React, { useEffect, useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";

import { login, logout, accountBalance } from "../near/utils";

const Home = function useAppWrapper() {
  const navigate = useNavigate();
  const [date, setDate] = useState("");
  return (
    <div
      className='d-flex justify-content-center flex-column text-center '
      style={{ background: "#000", minHeight: "100vh" }}
    >
      <div className='mt-auto text-light mb-5'>
        <h1>UNCHAIN HOTEL BOOKING</h1>
        <p>Select the dates you would like to stay at the hotel.</p>
        <Form>
          <Row className='justify-content-center'>
            <Col xs='auto'>
              <Form.Control
                type='date'
                htmlSize='10'
                onChange={(e) => {
                  setDate(e.target.value);
                }}
              />
            </Col>
            <Col xs='auto'>
              <Button
                variant='secondary'
                onClick={() =>
                  // triggerSearch();
                  navigate(`/search/${date}`)
                }
              >
                Search
              </Button>
            </Col>
          </Row>
        </Form>
      </div>
      <p className='mt-auto text-secondary'>Powered by NEAR</p>
    </div>
  );
};

export default Home;
