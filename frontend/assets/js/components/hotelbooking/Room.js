import React from "react";
import PropTypes from "prop-types";
import { utils } from "near-api-js";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Button from "react-bootstrap/Button";
import Image from "react-bootstrap/Image";

const Room = ({ room, booking }) => {
  const {
    name,
    use_time,
    description,
    location,
    image,
    price,
    owner_id,
    status,
  } = room;

  const triggerBooking = () => {
    booking(owner_id, name, price);
    console.log("Called booking in triggerBooking");
  };

  return (
    <Row style={{ padding: "20px" }}>
      <Col xs={1}></Col>
      <Col xs={2}>
        <Image src={image} alt={name} width='300' fluid />
      </Col>
      <Col xs={5}>
        <h4>{owner_id}</h4>
        <h4>{name}</h4>
        <p>{description}</p>
        <h5>{location}</h5>
      </Col>
      <Col xs={2}>
        <p>check in</p>
        <h6>{use_time.check_in}</h6>
        <p>check out</p>
        <h6>{use_time.check_out}</h6>
      </Col>
      <Col xs={2}>
        <p>1 bed / 1 night</p>
        <Button
          variant='outline-dark'
          disabled={!window.accountId}
          onClick={triggerBooking}
        >
          Book for {utils.format.formatNearAmount(price)} NEAR
        </Button>
      </Col>
    </Row>
  );
};

Room.PrpoTypes = {
  room: PropTypes.instanceOf(Object).isRequired,
  booking: PropTypes.func.isRequired,
};

export default Room;
