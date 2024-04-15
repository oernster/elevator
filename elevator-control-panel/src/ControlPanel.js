import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ControlPanel = () => {
  const [selectedFloor, setSelectedFloor] = useState(null);
  const [selectedElevator, setSelectedElevator] = useState(null);
  const [elevatorInfo, setElevatorInfo] = useState({});
  const [lifts, setLifts] = useState([]);

  useEffect(() => {
    const fetchElevatorConfig = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/lift/config/');
        const elevatorData = response.data.lifts;

        if (!Array.isArray(elevatorData)) {
          throw new Error('Invalid elevator data');
        }

        setLifts(elevatorData);
      } catch (error) {
        console.error('Error fetching elevator configuration:', error);
      }
    };

    const fetchElevatorStatus = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/lift/status/');
        const elevatorStatus = response.data;
        setElevatorInfo(elevatorStatus);
      } catch (error) {
        console.error('Error fetching elevator status:', error);
      }
    };

    const interval = setInterval(() => {
      fetchElevatorStatus();
    }, 1000);

    fetchElevatorConfig();
    fetchElevatorStatus();

    return () => clearInterval(interval);
  }, []);

  const handleFloorSelection = async (floor, targetElevator) => {
    try {
      const response = await axios.post('http://localhost:8000/api/lift/request/', {
        from_floor: null,
        to_floor: floor,
        elevatorId: targetElevator
      });

      // Update elevator info and selected floor
      setElevatorInfo(response.data);
      setSelectedFloor(floor);
      setSelectedElevator(targetElevator);

      // Reset selected floor and elevator after a delay
      setTimeout(() => {
        setSelectedFloor(null);
        setSelectedElevator(null);
      }, 5000);
    } catch (error) {
      console.error('Error requesting elevator:', error);
    }
  };

  const isElevatorArrived = (elevatorId, floor) => {
    if (!Array.isArray(elevatorInfo)) {
      return false;
    }
    const elevator = elevatorInfo.find(elevator => elevator.id === elevatorId);
    if (elevator) {
      return elevator.floor === floor;
    }
    return false;
  };
  
  


  return (
    <div style={{ paddingLeft: '25px', paddingTop: '25px' }}>
      <h2>Select Floor:</h2>
      <div>
        {lifts.map(lift => (
          <div key={lift.elevator} style={{ marginLeft: '25px' }}>
            <p>Elevator: {lift.elevator}</p>
            {lift.serviced_floors.map(floor => (
              <button
                key={floor}
                onClick={() => handleFloorSelection(floor, lift.elevator)}
                disabled={selectedFloor === floor && selectedElevator === lift.elevator}
                style={{ 
                  marginRight: '5px', 
                  opacity: selectedFloor === floor && selectedElevator === lift.elevator ? 0.5 : 1,
                  backgroundColor: 
                    isElevatorArrived(lift.elevator, floor)
                      ? 'green' 
                      : selectedFloor === floor && selectedElevator === lift.elevator 
                        ? 'grey' 
                        : '#f0f0f0', // Light grey background
                  color: 
                    isElevatorArrived(lift.elevator, floor)
                      ? 'yellow' 
                      : 'black' 
                }}
              >
                {floor}
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ControlPanel;
