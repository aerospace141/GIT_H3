import React, { useState } from 'react';

const Switch = ({ defaultChecked }) => {
  const [showStreaks, setShowStreaks] = useState(false);
  const [autoPlayNext, setAutoPlayNext] = useState(false);
  const [appleHealth, setAppleHealth] = useState(false);

  return <label className="toggle-switch">
            <input 
              type="checkbox"
              checked={appleHealth}
              onChange={() => setAppleHealth(!appleHealth)}
            />
            <span className="slider"></span>
          </label>;
};

export default Switch;
