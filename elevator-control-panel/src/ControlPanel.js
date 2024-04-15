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
        const elevatorConfigs = response.data.lifts; // Assuming the response contains 'lifts' key
        const allServicedFloors = elevatorConfigs.flatMap(config => config.serviced_floors);
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
      setSelectedFloor(floor); // Update selected floor
    } catch (error) {
      console.error('Error requesting elevator:', error);
    }
  };

  return (
    <div>
      <h2>Select Floor:</h2>
      <div>
        {servicedFloors.length > 0 ? (
          servicedFloors.map(floor => (
            <button
              key={floor}
              onClick={() => handleFloorSelection(floor)}
              disabled={selectedFloor === floor}
              style={{ marginRight: '5px' }}
            >
              {floor}
            </button>
          ))
        ) : (
          <p>No serviced floors available</p>
        )}
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
