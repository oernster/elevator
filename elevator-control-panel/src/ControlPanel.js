import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ControlPanel = () => {
  const [selectedFloor, setSelectedFloor] = useState(null);
  const [selectedElevator, setSelectedElevator] = useState(null);
  const [elevatorInfo, setElevatorInfo] = useState([]);
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
        setElevatorInfo(elevatorStatus);  // Assuming elevatorInfo contains the destinations data
      } catch (error) {
        console.error('Error fetching elevator status:', error);
      }
    };

    // Fetch elevator configuration initially
    fetchElevatorConfig();

    // Set up interval for fetching elevator status
    const interval = setInterval(() => {
      fetchElevatorStatus();
    }, 1000);

    // Fetch elevator status initially
    fetchElevatorStatus();

    // Clean up interval
    return () => clearInterval(interval);
  }, []);

  const handleFloorSelection = async (floor, targetElevator) => {
    try {
      const response = await axios.post('http://localhost:8000/api/lift/request/', {
        from_floor: null,
        to_floor: floor,
        elevatorId: targetElevator
      });
  
      // Assuming the response contains updated elevator information
      setElevatorInfo(response.data); // Update elevator info with new data
  
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
    
    for (let i = 0; i < elevatorInfo.length; i++) {
      if (elevatorInfo[i].id === elevatorId) {
        return elevatorInfo[i].floor === floor;
      }
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
            <p><b>Destinations:</b></p>
            <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center' }}>
              {elevatorInfo && Array.isArray(elevatorInfo) && elevatorInfo.map(elevator => {
                if (elevator.id === lift.elevator && elevator.destinations) {
                  return elevator.destinations.map((destination, index) => (
                    <b key={index} style={{ marginRight: '10px' }}>{destination}</b>
                  ));
                }
                return null; // Return null if elevator ID doesn't match or destinations are undefined
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
  };
  
  export default ControlPanel;
  
  
  