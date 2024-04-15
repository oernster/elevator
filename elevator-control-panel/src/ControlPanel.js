import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ControlPanel = () => {
  const [selectedFloor, setSelectedFloor] = useState(null);
  const [selectedElevator, setSelectedElevator] = useState(null);
  const [elevatorInfo, setElevatorInfo] = useState([]);
  const [lifts, setLifts] = useState([]);
  const [highlightedFloor, setHighlightedFloor] = useState(null);
  const [directionIndicator, setDirectionIndicator] = useState('');
  const [stopIndicator, setStopIndicator] = useState(false);
  const UP_ARROW = '↑';
  const DOWN_ARROW = '↓';
  
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
      // Check if the selected floor is serviced by the elevator
      const elevator = lifts.find((lift) => lift.elevator === targetElevator);
      if (!elevator || !elevator.serviced_floors.includes(floor)) {
        console.error('Selected floor is not serviced by the elevator.');
        return;
      }
  
      // Request the elevator to move to the selected floor
      const response = await axios.post('http://localhost:8000/api/lift/request/', {
        from_floor: null,
        to_floor: floor,
        elevatorId: targetElevator
      });
  
      // Assuming the response contains updated elevator information
      setElevatorInfo(response.data);
  
      setSelectedFloor(floor);
      setSelectedElevator(targetElevator);
  
      // Reset highlighted floor
      setHighlightedFloor(null);
      // Reset direction and stop indicators
      setDirectionIndicator('');
      setStopIndicator(false);
  
      // Start sequential highlighting for the selected elevator
      await highlightFloorsSequentially(targetElevator, floor);
  
      // Set the final floor to green after sequence is completed
      setHighlightedFloor(floor);
  
      // Set stop indicator on arrival
      setStopIndicator(true);
  
      // Reset selected floor and elevator after a delay
      setTimeout(() => {
        setSelectedFloor(null);
        setSelectedElevator(null);
        setHighlightedFloor(null); // Reset highlighted floor
        setStopIndicator(false); // Reset stop indicator
      }, 5000);
    } catch (error) {
      console.error('Error requesting elevator:', error);
    }
  };
  
  
  const handleGlobalFloorSelection = async (floor) => {
    try {
      if (!elevatorInfo) {
        console.error('Elevator information is not available.');
        return;
      }
  
      // Iterate through each elevator
      for (const elevator of lifts) {
        // Check if the elevator services the selected global floor
        if (elevator.serviced_floors.includes(floor)) {
          // Call the function to handle floor selection for the current elevator
          await handleFloorSelection(floor, elevator.elevator);
        }
      }
    } catch (error) {
      console.error('Error requesting all elevators to move:', error);
    }
  };
  
  
  const setHighlightedFloorForElevator = (elevatorId, floor) => {
    // Set the final floor to green for the specified elevator
    setHighlightedFloor(floor);
  
    // Set stop indicator on arrival
    setStopIndicator(true);
  
    // Reset stop indicator and highlighted floor after a delay
    setTimeout(() => {
      setStopIndicator(false); // Reset stop indicator
      setHighlightedFloor(null); // Reset highlighted floor
    }, 5000);
  };
  

  const highlightFloorsSequentially = async (elevatorId, targetFloor) => {
    const elevator = elevatorInfo.find((elevator) => elevator.id === elevatorId);
    if (!elevator || !elevator.destinations) {
      return;
    }
  
    const currentFloor = elevator.floor;
    const destinationFloors = elevator.destinations;
  
    const start = currentFloor;
    const end = targetFloor;
    const direction = Math.sign(end - start);
  
    setDirectionIndicator(direction === 1 ? '↑' : '↓');
  
    for (let floor = start; direction === 1 ? floor <= end : floor >= end; floor += direction) {
      setHighlightedFloor(floor);
      await delay(1000); // Wait for 1 second before moving to the next floor
    }
  };
  
  
  
  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

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
      <h2>Select Global Floor:</h2>
      <div>
        {Array.from({ length: 10 }, (_, i) => (
          <button
            key={i + 1}
            onClick={() => elevatorInfo && handleGlobalFloorSelection(i + 1)}
            style={{
              marginRight: '5px',
              backgroundColor: selectedFloor === i + 1 ? 'pink' : undefined,
              color: selectedFloor === i + 1 ? 'white' : 'black',
            }}
          >
          {i + 1}
        </button>
        
        ))}
      </div>
      <h2>Select Floor for Each Elevator:</h2>
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
                    highlightedFloor === floor && selectedElevator === lift.elevator
                      ? 'yellow' // yellow for intermediate floors
                      : isElevatorArrived(lift.elevator, floor)
                        ? 'green' // green for arrival floor
                        : selectedFloor === floor && selectedElevator === lift.elevator
                          ? 'grey' // Grey for selected floor
                          : '#f0f0f0', // Light grey background for other floors
                  color:
                    isElevatorArrived(lift.elevator, floor) || highlightedFloor === floor
                      ? 'black' // Black text color for the arrival and highlighted floor
                      : 'black' // Black text color for other floors
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
      <div style={{ marginTop: '20px' }}>
        <p><b>Direction:</b> {directionIndicator}</p>
        {stopIndicator && <p style={{ color: 'red' }}>STOP</p>}
      </div>
    </div>
  );
};

export default ControlPanel;
