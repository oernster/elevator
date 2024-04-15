import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ControlPanel = () => {
  const [selectedFloor, setSelectedFloor] = useState(null);
  const [selectedElevator, setSelectedElevator] = useState(null);
  const [elevatorInfo, setElevatorInfo] = useState([]);
  const [lifts, setLifts] = useState([]);
  const [highlightedFloors, setHighlightedFloors] = useState({});
  const [stopIndicators, setStopIndicators] = useState({});
  const [directionIndicators, setDirectionIndicators] = useState({});
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

      // Reset highlighted floors, direction, and stop indicators for the specific elevator
      setHighlightedFloors(prevState => ({ ...prevState, [targetElevator]: null }));
      setDirectionIndicators(prevState => ({ ...prevState, [targetElevator]: '' }));
      setStopIndicators(prevState => ({ ...prevState, [targetElevator]: false }));

      // Start sequential highlighting for the selected elevator
      await highlightFloorsSequentially(targetElevator, floor);

      // Set the final floor to green after sequence is completed
      setHighlightedFloors(prevState => ({ ...prevState, [targetElevator]: floor }));
      setStopIndicators(prevState => ({ ...prevState, [targetElevator]: true }));

      // Reset selected floor and elevator after a delay
      setTimeout(() => {
        setSelectedFloor(null);
        setSelectedElevator(null);
        setHighlightedFloors(prevState => ({ ...prevState, [targetElevator]: null }));
        setStopIndicators(prevState => ({ ...prevState, [targetElevator]: false }));
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

      let nearestElevator = null;
      let minDistance = Infinity;

      // Iterate through each elevator
      for (const elevator of lifts) {
        // Check if the elevator services the selected global floor
        if (elevator.serviced_floors.includes(floor)) {
          // Calculate the distance between the elevator's current floor and the requested floor
          const distance = Math.abs(elevatorInfo.find(e => e.id === elevator.elevator).floor - floor);
          // Update the nearest elevator if the current elevator is closer
          if (distance < minDistance) {
            minDistance = distance;
            nearestElevator = elevator.elevator;
          }
        }
      }

      // Call the function to handle floor selection for the nearest elevator
      if (nearestElevator) {
        await handleFloorSelection(floor, nearestElevator);
      }
    } catch (error) {
      console.error('Error selecting nearest elevator:', error);
    }
  };

  const highlightFloorsSequentially = async (elevatorId, targetFloor) => {
    try {
      const elevator = elevatorInfo.find((elevator) => elevator.id === elevatorId);
      if (!elevator || !elevator.destinations) {
        return;
      }

      const currentFloor = elevator.floor;
      const destinationFloors = elevator.destinations;

      const start = currentFloor;
      const end = targetFloor;
      const direction = Math.sign(end - start);

      setDirectionIndicators(prevState => ({ ...prevState, [elevatorId]: direction === 1 ? '↑' : '↓' }));

      for (let floor = start; direction === 1 ? floor <= end : floor >= end; floor += direction) {
        await delay(1000); // Wait for 1 second before moving to the next floor
        setHighlightedFloors(prevState => ({ ...prevState, [elevatorId]: floor }));
      }
    } catch (error) {
      console.error('Error highlighting floors sequentially:', error);
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
      <h2>Request Floor - Quickest Lift:</h2>
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
            <p><b>Elevator: {lift.elevator}</b></p>
            {lift.serviced_floors.map(floor => (
              <button
                key={floor}
                onClick={() => handleFloorSelection(floor, lift.elevator)}
                disabled={selectedFloor === floor && selectedElevator === lift.elevator}
                style={{
                  marginRight: '5px',
                  opacity: selectedFloor === floor && selectedElevator === lift.elevator ? 0.5 : 1,
                  backgroundColor:
                    highlightedFloors[lift.elevator] === floor
                      ? 'yellow' // yellow for intermediate floors
                      : isElevatorArrived(lift.elevator, floor)
                      ? 'green' // green for arrival floor
                      : selectedFloor === floor && selectedElevator === lift.elevator
                      ? 'grey' // Grey for selected floor
                      : '#f0f0f0', // Light grey background for other floors
                  color:
                    isElevatorArrived(lift.elevator, floor) || highlightedFloors[lift.elevator] === floor
                      ? 'black' // Black text color for the arrival and highlighted floor
                      : 'black' // Black text color for other floors
                }}
              >
                {floor}
              </button>
            ))}
            <p><b>Destinations:</b></p>
            <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center' }}>
              {elevatorInfo &&
                Array.isArray(elevatorInfo) &&
                elevatorInfo.map((elevator) => {
                  if (elevator.id === lift.elevator && elevator.destinations) {
                    return elevator.destinations.map((destination, index) => (
                      <p key={index} style={{ marginRight: '10px' }}>
                        {destination}
                      </p>
                    ));
                  }
                  return null; // Return null if elevator ID doesn't match or destinations are undefined
                })}
            </div>
            <div style={{ marginTop: '20px' }}>
              <p><b>Direction:</b> {directionIndicators[lift.elevator]}</p>
              {stopIndicators[lift.elevator] && <p style={{ color: 'red' }}>STOP</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ControlPanel;
