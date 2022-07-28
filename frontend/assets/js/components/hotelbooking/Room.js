import React from "react";
import PropTypes from "prop-types";
import { utils } from "near-api-js";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Button from "react-bootstrap/Button";
import Image from "react-bootstrap/Image";

const Room = ({ room, booking }) => {
  const { id, name, description, location, image, price, owner_id, status } =
    room;
  // console.log(room);

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
      <Col xs={7}>
        <h3>HOTEL NAME</h3>
        <h4>{name}</h4>
        <p>{description}</p>
        <h5>{location}</h5>
        <p>1 room / 1 bed / 1 night</p>
      </Col>
      <Col xs={2}>
        <Button variant='outline-dark' onClick={triggerBooking}>
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
