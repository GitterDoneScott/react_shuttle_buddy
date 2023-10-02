// src/App.js
import React, { useState, useEffect } from 'react';
import Dexie from 'dexie';
import './App.css';

const db = new Dexie('VehiclesDB');
db.version(1).stores({
  vehicles: '++id, description, passengerCapacity, boatCapacity'
});



function App() {
  const [vehicles, setVehicles] = useState([]);
  const [totalBoats, setTotalBoats] = useState('');
  const [totalPaddlers, setTotalPaddlers] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    db.vehicles.toArray().then(setVehicles);
  }, []);

  const addVehicle = (vehicle) => {
    db.vehicles.add(vehicle).then(() => {
      setVehicles([...vehicles, vehicle]);
    });
  };

  const removeVehicle = (id) => {
    db.vehicles.delete(id).then(() => {
      setVehicles(vehicles.filter(vehicle => vehicle.id !== id));
    });
  };

  const clearVehicles = () => {
    db.vehicles.clear().then(() => {
      setVehicles([]);
    });
  };

  const calculate = () => {
    const totalBoatsNum = parseInt(totalBoats, 10);
    const totalPaddlersNum = parseInt(totalPaddlers, 10);
    setError('');

    if (isNaN(totalBoatsNum) || isNaN(totalPaddlersNum) || totalBoatsNum < 0 || totalPaddlersNum < 0) {
      setError('Please enter valid numbers for total boats and paddlers.');
      return;
    }

    const sortedVehicles = [...vehicles].sort((a, b) => (b.passengerCapacity + b.boatCapacity) - (a.passengerCapacity + a.boatCapacity));

    let remainingBoats = totalBoatsNum;
    let remainingPaddlers = totalPaddlersNum;
    const selectedVehicles = [];

    for (let vehicle of sortedVehicles) {
      if (remainingBoats > 0 || remainingPaddlers > 0) {
        const canCarryBoats = Math.min(vehicle.boatCapacity, remainingBoats);
        const canCarryPaddlers = Math.min(vehicle.passengerCapacity, remainingPaddlers);

        if (canCarryBoats > 0 || canCarryPaddlers > 0) {
          selectedVehicles.push({ ...vehicle, isSelected: true });
          remainingBoats -= canCarryBoats;
          remainingPaddlers -= canCarryPaddlers;
        } else {
          selectedVehicles.push({ ...vehicle, isSelected: false });
        }
      } else {
        selectedVehicles.push({ ...vehicle, isSelected: false });
      }
    }

    if (remainingBoats > 0 || remainingPaddlers > 0) {
      setError('Not enough capacity to shuttle all boats and paddlers.');
    }

    setVehicles(selectedVehicles);
  };

  return (
    <div className="App">
      <label>
        Total Boats:
        <input
          type="number"
          value={totalBoats}
          onChange={e => setTotalBoats(e.target.value)}
          placeholder="Total Boats"
        />
      </label>
      <label>
        Total Paddlers:
        <input
          type="number"
          value={totalPaddlers}
          onChange={e => setTotalPaddlers(e.target.value)}
          placeholder="Total Paddlers"
        />
      </label>
      <VehicleForm onAddVehicle={addVehicle} />
      <VehicleTable vehicles={vehicles} onRemoveVehicle={removeVehicle} onClearVehicles={clearVehicles} />

      <button onClick={calculate}>Calculate</button>
      {error && <div className="error">{error}</div>}
    </div>
  );
}

function VehicleForm({ onAddVehicle }) {
  const [description, setDescription] = useState('');
  const [passengerCapacity, setPassengerCapacity] = useState('');
  const [boatCapacity, setBoatCapacity] = useState('');

  const submitHandler = (e) => {
    e.preventDefault();
    onAddVehicle({ description, passengerCapacity: parseInt(passengerCapacity, 10), boatCapacity: parseInt(boatCapacity, 10) });
    setDescription('');
    setPassengerCapacity('');
    setBoatCapacity('');
  };

  return (
    <form onSubmit={submitHandler}>
      <label>
        Vehicle Description:
        <input
          type="text"
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="Vehicle Description"
          required
        />
      </label>
      <label>
        Passenger Capacity:
        <input
          type="number"
          value={passengerCapacity}
          onChange={e => setPassengerCapacity(e.target.value)}
          placeholder="Passenger Capacity"
          required
        />
      </label>
      <label>
        Boat Capacity:
        <input
          type="number"
          value={boatCapacity}
          onChange={e => setBoatCapacity(e.target.value)}
          placeholder="Boat Capacity"
          required
        />
      </label>
      <button type="submit">Add Vehicle</button>
    </form>
  );
}

function VehicleTable({ vehicles, onRemoveVehicle, onClearVehicles }) {
  return (
    <div className="Table-container">
      <table className="Table">
        <thead>
          <tr>
            <th>Description</th>
            <th>Passenger Capacity</th>
            <th>Boat Capacity</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {vehicles.map(vehicle => (
            <tr key={vehicle.id} className={vehicle.isSelected ? 'TableRow--selected' : ''}>
              <td data-label="Description">{vehicle.description}</td>
              <td data-label="Passenger Capacity">{vehicle.passengerCapacity}</td>
              <td data-label="Boat Capacity">{vehicle.boatCapacity}</td>
              <td data-label="Action"><button onClick={() => onRemoveVehicle(vehicle.id)}>Remove</button></td>
            </tr>
          ))}
        </tbody>
      </table>
      <button onClick={onClearVehicles}>Clear All</button>
    </div>
  );

}

export default App;
