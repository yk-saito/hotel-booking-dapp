import React from "react";
import PropTypes from "prop-types";
import { utils } from "near-api-js";
import { Card, Button, Col } from "react-bootstrap";

const Room = ({ room, booking }) => {
  const { id, name, description, location, image, price, owner_id, status } =
    room;
  // console.log(room);

  const triggerBooking = () => {
    booking(owner_id, name, price);
    console.log("Called booking in triggerBooking");
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
          <Card.Text>1 room / 1 bed / 1 night</Card.Text>
          <Button variant='outline-dark' onClick={triggerBooking}>
            Book for {utils.format.formatNearAmount(price)} NEAR
          </Button>
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
