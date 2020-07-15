import React, { Component } from 'react';
import './style.css';
const proxyUrl = "https://cors-anywhere.herokuapp.com/";

export class GoogleComponent extends Component {
  constructor(props) {
    super(props);

    this.state = {
      collection: null,
      collectionShow: false,
      place: '',
      allowCountry: '',
      location: '',
      returnData: {

      },
      currentLocation: '',
      currentCoordinates: {},
      liStyle: '',
      proxyUrl: " ",
      placeholder: ""
    };
  }

  async componentDidMount() {

    await this.setState({ 
      liStyle: this.props.locationListStyle ? this.props.locationListStyle : 'style-list',
      placeholder: this.props.placeholder ? this.props.placeholder : 'Start Typing Location'
    })

    if (this.props.currentLocationByDefault && !this.props.currentCoordinates) {
      this.getCurrentLocation({shortLocation: true})
    }

    if (this.props.currentCoordinates) {
      this.getLocationByCoordinates(this.props.currentCoordinates)
    }

    let _ico = React.createElement("img", {
      className: 'current-loc-ico',
      src: "https://www.materialui.co/materialIcons/maps/my_location_black_192x192.png",
    })
    let _current = React.createElement("li",
      { className: this.state.liStyle, onClick: () => this.getCurrentLocation(), },
      _ico, "Current Location");
    this.setState({ currentLocation: _current })
    document.addEventListener("mousedown", (e) => this.handleClickOutside(e));
  }

  componentWillUnmount() {
    document.removeEventListener("mousedown", (e) => this.handleClickOutside(e));


  }
  setWrapperRef(node) {
    this.wrapperRef = node;
  }
  handleClickOutside(event) {
    if (this.wrapperRef && !this.wrapperRef.contains(event.target)) {
      this.setState({ collectionShow: false })

    }
  }
  getInfo(param) {
    let child = []
    let _co = this.props.country ? 'components=' + this.props.country + '&' : '';
    let _lang = this.props.language ? 'language=' + this.props.language + '&' : '';

    if (this.props.apiKey) {

      let _fire = fetch(this.state.proxyUrl + 'https://maps.googleapis.com/maps/api/place/autocomplete/json?input=' +
        param + '&' + _lang + _co + '&key=' + this.props.apiKey
      )

      _fire.then((dataJson) => {
        return dataJson.json().then((data) => {
          if (data.status == "OK" && data.predictions.length > 0) {
            for (let loc = 0; loc < data.predictions.length; loc++) {
              child.push(React.createElement("li",
                { key: loc, className: this.state.liStyle, onClick: () => this.arrangeList(data.predictions[loc].description), },
                data.predictions[loc].description));
            }
          }
          else if (data.state == "REQUEST_DENIED") {
            child.push(React.createElement("li",
              { className: this.state.liStyle }, data.error_message));
          }
          else {
            child.push(React.createElement("li",
              { className: this.state.liStyle },
              "NO Result Found"));
          }
          let collection = React.createElement("ul", { className: 'style-unordered-list' },
            child
          )
          this.setState({ collection: collection, collectionShow: true })
        })
      }).catch(error => {
        this.setState({ proxyUrl: proxyUrl })

      })
    }
    else {
      child.push(React.createElement("li",
        { className: this.state.liStyle }, "No Api Key Provided"));
      let collection = React.createElement("ul", { className: 'style-unordered-list' },
        child
      )
      this.setState({ collection: collection, collectionShow: true })
    }
  }

  getLocationByCoordinates(coordinates) {
    if (this.props.apiKey) {
      const address = `${coordinates.lat},${coordinates.lng}`
      let _fire = fetch(this.state.proxyUrl + 'https://maps.googleapis.com/maps/api/place/textsearch/json?query=' + address + '&key=' + this.props.apiKey
      )
      return _fire.then((resp) => {
        return resp.json().then((res) => {
          const location = res.results[res.results.length - 2].formatted_address
          this._returnData(location)
          this.setState({ collectionShow: false })
          return res
        })
      }).catch(error => {
        this.setState({ proxyUrl: proxyUrl })

      })
    }
  }

  getCoordinates(address) {
    if (this.props.apiKey) {
      let _fire = fetch(this.state.proxyUrl + 'https://maps.googleapis.com/maps/api/geocode/json?address=' + address + '&key=' + this.props.apiKey
      )
      return _fire.then((resp) => {
        return resp.json().then((res) => {
          return res
        })
      }).catch(error => {
        this.setState({ proxyUrl: proxyUrl })

      })
    }

  }
  getCurrentLocation({shortLocation = false}) {
    if (this.props.apiKey) {
      navigator.geolocation.getCurrentPosition((location) => {

        var obj = "latlng=" + location.coords.latitude + "," + location.coords.longitude;

        let _fire = fetch(this.state.proxyUrl + 'https://maps.googleapis.com/maps/api/geocode/json?' + obj + '&key=' + this.props.apiKey
        )
        return _fire.then((resp) => {
          return resp.json().then((res) => {
            let location = res.results[0].formatted_address
            if (shortLocation) location = res.results[res.results.length - 2].formatted_address

            this._returnData(location)
            this.setState({ collectionShow: false })
          })
        }).catch(error => {
          this.setState({ proxyUrl: proxyUrl })

        })
      });

    }
  }
  arrangeList(place) {
    this._returnData(place)
    this.setState({ collectionShow: false })
  }
  arrangeValue(item) {

    this.getInfo(item)
    this.setState({ place: item })
    this.state.returnData.place = item;
    this.state.returnData.coordinates = ""
    if (this.props.onChange) {
      this.props.onChange(this.state.returnData)
    }
  }
  async _returnData(place) {
    this.setState({ place: place })
    let location = {}
    location = await this.getCoordinates(place)
    this.state.returnData.place = place;

    if (this.props.coordinates) {
      if (location.status == 'OK') {

        this.state.returnData.coordinates = location.results[0].geometry.location
      }
      else {
        this.state.returnData.coordinates = "Error"
      }
    }
    else {
      this.state.returnData.coordinates = "Coordinates return false by props"
    }

    if (this.props.onChange) {
      this.props.onChange(this.state.returnData)
    }
  }
  render() {

    return (
      React.createElement("div", { className: 'location-box-cover', ref: (node) => this.setWrapperRef(node) },

        React.createElement("input", {
          type: "text",
          className: this.props.locationBoxStyle ? this.props.locationBoxStyle : 'location-box',
          onChange: (e) => this.arrangeValue(e.target.value),
          placeholder: this.state.placeholder,
          value: this.state.place,
          title: this.state.place
        }
        ),
        this.state.collectionShow ?
          React.createElement("div", { className: "google-covert" },
            this.state.currentLocation, this.state.collection
          )
          : null
      )
    )
  }
}
