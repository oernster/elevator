import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ControlPanel = () => {
  const [selectedFloor, setSelectedFloor] = useState(null);
  const [elevatorInfo, setElevatorInfo] = useState(null);
  const [servicedFloors, setServicedFloors] = useState([]);

  useEffect(() => {
    const fetchElevatorConfig = async () => {
      try {
        const response = await axios.get('/api/lift/config/');
        const elevatorConfigs = response.data.lifts;
        const allServicedFloors = Object.values(elevatorConfigs).reduce((acc, config) => {
          return [...acc, ...config.serviced_floors];
        }, []);
        setServicedFloors([...new Set(allServicedFloors)]); // Remove duplicates
      } catch (error) {
        console.error('Error fetching elevator configuration:', error);
      }
    };

    fetchElevatorConfig();
  }, []);

  const handleFloorSelection = async (floor) => {
    try {
      const response = await axios.post('/api/lift/request/', {
        from_floor: 0, // Assuming the control panel is on the ground floor
        to_floor: floor
      });
      setElevatorInfo(response.data);
      setSelectedFloor(null); // Reset floor selection after request
    } catch (error) {
      console.error('Error requesting elevator:', error);
    }
  };

  return (
    <div>
      <h2>Select Floor:</h2>
      <div>
        {servicedFloors.map(floor => (
          <button key={floor} onClick={() => handleFloorSelection(floor)}>
            {floor}
          </button>
        ))}
      </div>
      {elevatorInfo && (
        <div>
          <p>Elevator: {elevatorInfo.lift}</p>
          {/* Display elevator direction arrow here */}
        </div>
      )}
    </div>
  );
};

export default ControlPanel;
