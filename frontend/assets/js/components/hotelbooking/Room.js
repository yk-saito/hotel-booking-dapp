import React from "react";
import PropTypes from "prop-types";
import { utils } from "near-api-js";
import { Card, Button, Col, Badge, Stack } from "react-bootstrap";

const Room = ({ room, buy }) => {
  const { room_id, price, name, description, sold, location, image, owner } =
    room;

  // const triggeBuy = () => {
  //   buy(room_id, price); // add owner
  // }

  return (
    <Col key={room_id}>
      {/* <Card className=' h-100'> */}
      <Card style={{ width: "18rem" }}>
        <Card.Header>{owner}</Card.Header>
        <div className=' ratio ratio-4x3'>
          <img src={image} alt={name} style={{ objectFit: "cover" }} />
        </div>
        <Card.Body>
          <Card.Title>{name}</Card.Title>
          <Card.Text>{description}</Card.Text>
          <Card.Text>{location}</Card.Text>
          {/* <Button></Button> */}
          <Card.Text>{price}</Card.Text>
        </Card.Body>
      </Card>
    </Col>
  );
};

Room.PrpoTypes = {
  room: PropTypes.instanceOf(Object).isRequired,
  // TODO: buy
};

export default Room;
