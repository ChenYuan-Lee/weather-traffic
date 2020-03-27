import React, { Component } from 'react';
import DatePicker from 'react-datepicker';
import moment from 'moment';
import { parseDateTime, fetchData, distance } from './utils'

import LocationsList from './LocationsList';
import { withStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import 'react-datepicker/dist/react-datepicker.css';
import 'typeface-roboto';

const styles = theme => ({
  root: {
    flexGrow: 1,
    padding: theme.spacing(2),
    backgroundColor: 'CornflowerBlue'
  },
  paper: {
    padding: theme.spacing(2),
    textAlign: 'center',
    color: theme.palette.text.primary,
    // backgroundColor: 'Orange'
  }
});

class App extends Component {

  constructor (props) {
    super(props)
    this.state = {
      queryDateTime: moment().toDate()
    }
    this.handleChange = this.handleChange.bind(this);
    this.handleSelectedLocation = this.handleSelectedLocation.bind(this);
  }

  handleChange(dateTime) {
    console.log(dateTime);
    this.setState({
      queryDateTime: dateTime,
      selectedLocation: null
    }, () => {
      this.makeRequests()
    })
  }

  makeRequests() {
    const dateTime = parseDateTime(this.state.queryDateTime);
    this.getTrafficCamData(dateTime)
      .then((data) => {
        this.setState({
          trafficCamData: data.items[0].cameras,
          trafficCamDateTime: data.items[0].timestamp
        })
      });
    this.getWeatherData(dateTime)
      .then((data) => {
        this.setState({
          weatherAreaMetaData: data.area_metadata,
          weatherForecasts: data.items[0].forecasts,
          weatherUpdateTimestamp: data.items[0].update_timestamp,
          weatherValidPeriod: data.items[0].valid_period,
        })
      });
  }

  getTrafficCamData = async (dateTime) => {
    const url = 'https://api.data.gov.sg/v1/transport/traffic-images';
    return fetchData(dateTime, url);
  }

  getWeatherData = async (dateTime) => {
    const url = 'https://api.data.gov.sg/v1/environment/2-hour-weather-forecast';
    return fetchData(dateTime, url);
  }

  renderLocationsList(){
    const {trafficCamData, weatherAreaMetaData, weatherForecasts} = this.state
    let locListTag = <p><i>Please ensure a <strong>Date</strong> and <strong>Time</strong> is selected.</i></p>
    if (trafficCamData && weatherAreaMetaData && weatherForecasts) {
      let locationCount = {}
      let trafficWeatherData = trafficCamData.map((trafficCam) => {
        const { latitude, longitude } = trafficCam.location;
        const lat1 = latitude;
        const lon1 = longitude;
        let distances = weatherAreaMetaData.map((area) => {
          const { latitude, longitude } = area.label_location;
          const lat2 = latitude;
          const lon2 = longitude;
          return [distance(lat1, lon1, lat2, lon2), area.name];
        });
        distances.sort((a, b) => { return a[0] > b[0] ? 1 : -1 });
        const locationClosest = distances[0][1];
        let locationClosestText = locationClosest
        if (locationCount.hasOwnProperty(locationClosest)) {
          locationCount[locationClosest] += 1
          locationClosestText = `${locationClosest} ${locationCount[locationClosest]}`
        } else {
          locationCount[locationClosest] = 1
        }
        const areaForecast = weatherForecasts.filter((area) => {
          return area.area === locationClosest;
        });
        return {
          ...trafficCam,
          locationClosest: locationClosestText,
          forecast: areaForecast[0].forecast
        }
      });
      trafficWeatherData.sort((a, b) => { return a.locationClosest > b.locationClosest ? 1 : -1 })
      locListTag = <LocationsList locations={trafficWeatherData} handleSelected={this.handleSelectedLocation} />
    }
    return (
      locListTag
    )
  }

  handleSelectedLocation(selectedLocation) {
    this.setState({
      selectedLocation
    })
  }

  displayForecast() {
    const { trafficCamData, selectedLocation } = this.state
    let weatherInfoTag = <p><i>Please ensure a <strong>Date</strong> and <strong>Time</strong> is selected.</i></p>
    if (selectedLocation) {
      weatherInfoTag = <p>{selectedLocation.forecast}</p>
    } else if (trafficCamData) {
      weatherInfoTag = <p><i>Please select a location.</i></p>
    }
    return (
      weatherInfoTag
    )
  }

  renderTrafficImg() {
    const { trafficCamData, selectedLocation } = this.state
    let trafficInfoTag = <p><i>Please ensure a <strong>Date</strong> and <strong>Time</strong> is selected.</i></p>
    if (selectedLocation) {
      trafficInfoTag = <img style={{maxWidth: '100%', objectFit: 'cover'}} src={selectedLocation.image} alt={selectedLocation.location}/>
    } else if (trafficCamData) {
      trafficInfoTag = <p><i>Please select a location.</i></p>
    }
    return (
      <div>
        {trafficInfoTag}
      </div>
    )
  }

  componentDidMount() {
    this.makeRequests()
  }

  render() {
    const { classes } = this.props
    return (
      <React.Fragment>
      <AppBar position="sticky">
        <Toolbar>
          <Typography variant="h4">
            Weather and Traffic Information
          </Typography>
        </Toolbar>
      </AppBar>
      <div className={classes.root}>
        <Grid container spacing={3}>
          <Grid container item xs={12} spacing={3}>
            <Grid item xs={6} sm={4}>
              <Typography variant="h6">Date</Typography>
              <Paper className={classes.paper}>
                <DatePicker
                  selected={ this.state.queryDateTime }
                  onChange={ this.handleChange }
                  name="startDate"
                  dateFormat="dd/MM/yyyy"
                  maxDate={ moment().toDate() }
                />
              </Paper>
            </Grid>
            <Grid item xs={6} sm={4}>
              <Typography variant="h6">Time</Typography>
              <Paper className={classes.paper}>
                <DatePicker
                  selected={ this.state.queryDateTime }
                  onChange={ this.handleChange }
                  showTimeSelect
                  showTimeSelectOnly
                  timeIntervals={15}
                  timeCaption="Time"
                  dateFormat="h:mm aa"
                />
              </Paper>
            </Grid>
          </Grid>
          <Grid item xs={12} sm={8}>
            <Typography variant="h6">List of Locations</Typography>
            <Paper className={classes.paper}>
              {this.renderLocationsList()}
            </Paper>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography variant="h6">Weather Information</Typography>
            <Paper className={classes.paper}>
              {this.displayForecast()}
            </Paper>
          </Grid>
          <Grid item xs={12} sm={8}>
            <Typography variant="h6">Traffic Information</Typography>
            <Paper className={classes.paper}>
              {this.renderTrafficImg()}
            </Paper>
          </Grid>
        </Grid>
      </div>
      </React.Fragment>
    );
  }
}

export default withStyles(styles)(App);
