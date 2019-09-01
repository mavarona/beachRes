import React, { Component } from "react";
// import items from "./data";
import Client from "./Contentful";

const RoomContext = React.createContext();

class RoomProvider extends Component {
  state = {
    rooms: [],
    sortedRooms: [],
    featuredRooms: [],
    loading: true,
    type: "all",
    capacity: 1,
    price: 0,
    minPrice: 0,
    maxPrice: 0,
    minSize: 0,
    maxSize: 0,
    breakfast: false,
    pets: false
  };

  getData = async () => {
    try {
      let response = await Client.getEntries({
        content_type: "resortBeach",
        order: "fields.price"
      });
      console.log(response.items);
      let rooms = this.formatData(response.items);
      let featuredRooms = rooms.filter(room => room.featured === true);
      let maxPrice = Math.max(...rooms.map(item => item.price));
      let maxSize = Math.max(...rooms.map(item => item.size));
      this.setState({
        rooms,
        featuredRooms,
        sortedRooms: rooms,
        loading: false,
        price: maxPrice,
        maxPrice,
        maxSize
      });
    } catch (err) {
      console.log(err);
    }
  };

  componentDidMount() {
    this.getData();
  }

  formatData(items) {
    let tmpItems = items.map(item => {
      let id = item.sys.id;
      let images = item.fields.images.map(image => image.fields.file.url);
      let room = {
        ...item.fields,
        images,
        id
      };
      return room;
    });
    return tmpItems;
  }

  getRoom = slug => {
    let tmpRooms = [...this.state.rooms];
    const room = tmpRooms.find(room => room.slug === slug);
    return room;
  };

  handleChange = e => {
    const target = e.target;
    const value = target.type === "checkbox" ? target.checked : target.value;
    const name = target.name;
    this.setState(
      {
        [name]: value
      },
      this.filterRooms
    );
  };

  filterRooms = () => {
    let {
      rooms,
      type,
      capacity,
      price,
      minSize,
      maxSize,
      breakfast,
      pets
    } = this.state;
    let tmpRooms = [...rooms];
    capacity = parseInt(capacity);
    price = parseInt(price);
    if (type !== "all") {
      tmpRooms = tmpRooms.filter(room => room.type === type);
    }
    if (capacity !== 1) {
      tmpRooms = tmpRooms.filter(room => room.capacity >= capacity);
    }

    tmpRooms = tmpRooms.filter(room => room.price <= price);

    tmpRooms = tmpRooms.filter(
      room => room.size >= minSize && room.size <= maxSize
    );

    if (breakfast) {
      tmpRooms = tmpRooms.filter(room => room.breakfast === true);
    }

    if (pets) {
      tmpRooms = tmpRooms.filter(room => room.pets === true);
    }

    this.setState({
      sortedRooms: tmpRooms
    });
  };

  render() {
    return (
      <RoomContext.Provider
        value={{
          ...this.state,
          getRoom: this.getRoom,
          handleChange: this.handleChange
        }}
      >
        {this.props.children}
      </RoomContext.Provider>
    );
  }
}

const RoomConsumer = RoomContext.Consumer;

export function withRoomConsumer(Component) {
  return function ConsumerWrapper(props) {
    return (
      <RoomConsumer>
        {value => <Component {...props} context={value} />}
      </RoomConsumer>
    );
  };
}

export { RoomConsumer, RoomProvider, RoomContext };
