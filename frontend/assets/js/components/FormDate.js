import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";

const FormDate = () => {
  const navigate = useNavigate();
  const [date, setDate] = useState("");

  const isFormFilled = () => date;
  return (
    <Form>
      <Row
        className='justify-content-center'
        style={{ marginTop: "50px", marginBottom: "50px" }}
      >
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
            disabled={!isFormFilled()}
            onClick={() => navigate(`/search/${date}`)}
          >
            Search
          </Button>
        </Col>
      </Row>
    </Form>
  );
};

export default FormDate;
