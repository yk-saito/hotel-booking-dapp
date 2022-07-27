import "regenerator-runtime/runtime";
import React, { useEffect, useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";

const Home = function useAppWrapper() {
  const navigate = useNavigate();
  const [date, setDate] = useState("");
  return (
    <div className='text-center' style={{ margin: "200px" }}>
      <h1>Welcome.</h1>
      <h1>Select your stay dates and find a hotel!</h1>
      <Form style={{ marginTop: "50px" }}>
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
              onClick={() => navigate(`/search/${date}`)}
            >
              Search
            </Button>
          </Col>
        </Row>
      </Form>
    </div>
  );
};

export default Home;
