import React from "react";
import PropTypes from "prop-types";
import { utils } from "near-api-js";
import { Card, Button, Col, Badge, Stack } from "react-bootstrap";

const Room = ({ room, booking }) => {
  const { id, name, description, location, image, price, owner_id, status } =
    room;
  console.log(room);

  const triggerBooking = () => {
    booking(owner_id, name, price);
  };

  return (
    <Col>
      {/* <Card className=' h-100'> */}
      <Card style={{ width: "18rem" }}>
        <Card.Header>{owner_id}</Card.Header>
        <div className=' ratio ratio-4x3'>
          <img src={image} alt={name} style={{ objectFit: "cover" }} />
        </div>
        <Card.Body>
          <Card.Title>{name}</Card.Title>
          <Card.Text>{description}</Card.Text>
          <Card.Text>{location}</Card.Text>
          {status === "Available" && (
            <Button variant='outline-dark' onClick={triggerBooking}>
              Book for {utils.format.formatNearAmount(price)} NEAR
            </Button>
          )}
          {status !== "Available" && (
            <Button variant='secondary' onClick={triggerBooking} disabled>
              Booked
            </Button>
          )}
        </Card.Body>
      </Card>
    </Col>
  );
};

Room.PrpoTypes = {
  room: PropTypes.instanceOf(Object).isRequired,
  booking: PropTypes.func.isRequired,
};

export default Room;
