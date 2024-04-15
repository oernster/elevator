import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ControlPanel = () => {
  const [selectedFloor, setSelectedFloor] = useState(null);
  const [selectedElevator, setSelectedElevator] = useState(null);
  const [elevatorInfo, setElevatorInfo] = useState([]);
  const [lifts, setLifts] = useState([]);
  const [highlightedFloor, setHighlightedFloor] = useState(null);
  const [liftIndicators, setLiftIndicators] = useState({}); // State to track lift direction and STOP status for each elevator
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
        
        // Initialize lift indicators for each elevator
        const initialIndicators = elevatorData.reduce((acc, lift) => {
          acc[lift.elevator] = { direction: '', stop: false }; // Default to no direction and no STOP
          return acc;
        }, {});
        setLiftIndicators(initialIndicators);
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
      setLiftIndicators(prevIndicators => ({
        ...prevIndicators,
        [targetElevator]: { direction: '', stop: false }
      }));

      // Start sequential highlighting for the selected elevator
      await highlightFloorsSequentially(targetElevator, floor);

      // Set the final floor to green after sequence is completed
      setHighlightedFloor(floor);

      // Set stop indicator on arrival
      setLiftIndicators(prevIndicators => ({
        ...prevIndicators,
        [targetElevator]: { ...prevIndicators[targetElevator], stop: true }
      }));

      // Reset selected floor and elevator after a delay
      setTimeout(() => {
        setSelectedFloor(null);
        setSelectedElevator(null);
        setHighlightedFloor(null); // Reset highlighted floor
        setLiftIndicators(prevIndicators => ({
          ...prevIndicators,
          [targetElevator]: { ...prevIndicators[targetElevator], stop: false }
        }));
      }, 5000);
    } catch (error) {
      console.error('Error requesting elevator:', error);
    }
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

    setLiftIndicators(prevIndicators => ({
      ...prevIndicators,
      [elevatorId]: { direction: direction === 1 ? UP_ARROW : DOWN_ARROW, stop: false }
    }));

    for (let floor = start; direction === 1 ? floor <= end : floor >= end; floor += direction) {
      setHighlightedFloor(floor);
      await delay(1000); // Wait for 1 second
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
            <div style={{ marginTop: '20px' }}>
              <p><b>{liftIndicators[lift.elevator].direction} {liftIndicators[lift.elevator].stop && <span style={{ color: 'red' }}>STOP</span>}</b></p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ControlPanel;
