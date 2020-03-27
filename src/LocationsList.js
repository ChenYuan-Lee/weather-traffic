import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';

const useStyles = makeStyles(theme => ({
  root: {
    width: '100%',
    maxHeight: 300,
    overflow: 'auto',
    backgroundColor: theme.palette.background.paper,
    padding: 5
  },
}));

export default function SelectedListItem(props) {
  const classes = useStyles();
  const [selectedIndex, setSelectedIndex] = React.useState('');

  const handleListItemClick = (event, index, locationData) => {
    setSelectedIndex(index);
    props.handleSelected(locationData);
  };
  return (
    <div className={classes.root}>
        <List component="nav" aria-label="main mailbox folders">
        {props.locations.map((location, index) => {
            return (
                <ListItem
                    button
                    selected={selectedIndex === index}
                    onClick={event => handleListItemClick(event, index, location)}
                    key={index}
                >
                    <ListItemText primary={location.locationClosest} />
                </ListItem>
            )
        })}
        </List>
    </div>
  );
}
