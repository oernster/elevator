import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ControlPanel = () => {
  const [selectedFloor, setSelectedFloor] = useState(null);
  const [elevatorInfo, setElevatorInfo] = useState(null);
  const [lifts, setLifts] = useState([]);

  useEffect(() => {
    const fetchElevatorConfig = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/lift/config/');
        const elevatorData = response.data.lifts; // Assuming the response contains 'lifts' key

        if (!Array.isArray(elevatorData)) {
          throw new Error('Invalid elevator data');
        }

        setLifts(elevatorData);
      } catch (error) {
        console.error('Error fetching elevator configuration:', error);
      }
    };

    fetchElevatorConfig();
  }, []);

  const handleFloorSelection = async (floor) => {
    try {
      const response = await axios.post('http://localhost:8000/api/lift/request/', {
        from_floor: null,  // Adjust this based on your implementation
        to_floor: floor
      });
      setElevatorInfo(response.data);
      setSelectedFloor(floor);
    } catch (error) {
      console.error('Error requesting elevator:', error);
    }
  };

  return (
    <div>
      <h2>Select Floor:</h2>
      <div>
        {lifts.map(lift => (
          <div key={lift.elevator}>
            <p>Elevator: {lift.elevator}</p>
            {lift.serviced_floors.map(floor => (
              <button
                key={floor}
                onClick={() => handleFloorSelection(floor)}
                disabled={selectedFloor === floor}
                style={{ marginRight: '5px' }}
              >
                {floor}
              </button>
            ))}
          </div>
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
