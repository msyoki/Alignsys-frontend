import React, { useState } from 'react';
import {
  Checkbox,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  FormControlLabel,
  Typography
} from '@mui/material';

const UpdateCheckboxUserList = ({ allUsers, selectedUsers, onChange }) => {
  const [checked, setChecked] = useState(() =>
    allUsers
      .filter(user => selectedUsers.some(sel => sel.id === user.id))
      .map(user => user.id)
  );

  const handleToggle = (userId) => {
    const currentIndex = checked.indexOf(userId);
    const newChecked = [...checked];

    if (currentIndex === -1) {
      newChecked.push(userId);
    } else {
      newChecked.splice(currentIndex, 1);
    }

    setChecked(newChecked);

    // Optionally pass selected full objects back to parent
    if (onChange) {
      const selected = allUsers.filter(user => newChecked.includes(user.id));
      onChange(selected);
    }
  };

  return (
    <div>
      <Typography variant="h6">Select Users</Typography>
      <List>
        {allUsers.map((user) => (
          <ListItem key={user.id} dense button onClick={() => handleToggle(user.id)}>
            <ListItemIcon>
              <Checkbox
                edge="start"
                checked={checked.includes(user.id)}
                tabIndex={-1}
                disableRipple
              />
            </ListItemIcon>
            <ListItemText primary={user.title} />
          </ListItem>
        ))}
      </List>
    </div>
  );
};

export default UpdateCheckboxUserList;
