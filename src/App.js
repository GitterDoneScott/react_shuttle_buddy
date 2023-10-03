// src/App.js
import React, { useState, useEffect } from 'react';
import Dexie from 'dexie';
import './App.css';

const db = new Dexie('VehiclesDB');
db.version(1).stores({
  vehicles: '++id, description, boaterCapacity, boatCapacity'
});



function App() {
  const [vehicles, setVehicles] = useState([]);
  const [totalBoats, setTotalBoats] = useState('');
  const [totalBoaters, setTotalBoaters] = useState('');
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
    const totalBoatersNum = parseInt(totalBoaters, 10);
    setError('');

    if (isNaN(totalBoatsNum) || isNaN(totalBoatersNum) || totalBoatsNum < 0 || totalBoatersNum < 0) {
      setError('Please enter valid numbers for total boats and boaters.');
      return;
    }

    const sortedVehicles = [...vehicles].sort((a, b) => (b.boaterCapacity + b.boatCapacity) - (a.boaterCapacity + a.boatCapacity));

    let remainingBoats = totalBoatsNum;
    let remainingBoaters = totalBoatersNum;
    const selectedVehicles = [];

    for (let vehicle of sortedVehicles) {
      if (remainingBoats > 0 || remainingBoaters > 0) {
        const canCarryBoats = Math.min(vehicle.boatCapacity, remainingBoats);
        const canCarryBoaters = Math.min(vehicle.boaterCapacity, remainingBoaters);

        if (canCarryBoats > 0 || canCarryBoaters > 0) {
          selectedVehicles.push({ ...vehicle, isSelected: true });
          remainingBoats -= canCarryBoats;
          remainingBoaters -= canCarryBoaters;
        } else {
          selectedVehicles.push({ ...vehicle, isSelected: false });
        }
      } else {
        selectedVehicles.push({ ...vehicle, isSelected: false });
      }
    }

    if (remainingBoats > 0 || remainingBoaters > 0) {
      setError('Not enough capacity to shuttle all boats and boaters.');
    }

    setVehicles(selectedVehicles);
  };

  return (
    <div className="App">
        <div className="input-group">
            <label>Total Boats:</label>
            <input
                type="number"
                value={totalBoats}
                onChange={e => setTotalBoats(e.target.value)}
                placeholder="Total Boats"
            />
        </div>
        <div className="input-group">
            <label>Total Boaters:</label>
            <input
                type="number"
                value={totalBoaters}
                onChange={e => setTotalBoaters(e.target.value)}
                placeholder="Total Boaters"
            />
        </div>
        <hr className="section-break" />  {/* Horizontal line */}
      <VehicleForm onAddVehicle={addVehicle} />
      {error && <div className="error">{error}</div>}
      <VehicleTable vehicles={vehicles} onRemoveVehicle={removeVehicle} onClearVehicles={clearVehicles} />
      <button onClick={calculate}>Calculate</button>

    </div>
  );
}

function VehicleForm({ onAddVehicle }) {
  const [description, setDescription] = useState('');
  const [boaterCapacity, setboaterCapacity] = useState('');
  const [boatCapacity, setBoatCapacity] = useState('');

  const submitHandler = (e) => {
    e.preventDefault();
    onAddVehicle({ description, boaterCapacity: parseInt(boaterCapacity, 10), boatCapacity: parseInt(boatCapacity, 10) });
    setDescription('');
    setboaterCapacity('');
    setBoatCapacity('');
  };

  return (
    <form onSubmit={submitHandler} className="VehicleForm">
        <div className="input-group">
            <label>Vehicle Description:</label>
            <input
                type="text"
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Vehicle Description"
                required
            />
        </div>
        <div className="input-group">
            <label>Boater Capacity:</label>
            <input
                type="number"
                value={boaterCapacity}
                onChange={e => setboaterCapacity(e.target.value)}
                placeholder="Boater Capacity"
                required
            />
        </div>
        <div className="input-group">
            <label>Boat Capacity:</label>
            <input
                type="number"
                value={boatCapacity}
                onChange={e => setBoatCapacity(e.target.value)}
                placeholder="Boat Capacity"
                required
            />
        </div>
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
            <th>Vehicle Description</th>
            <th>Boater Capacity</th>
            <th>Boat Capacity</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {vehicles.map(vehicle => (
            <tr key={vehicle.id} className={vehicle.isSelected ? 'TableRow--selected' : ''}>
              <td data-label="Description">{vehicle.description}</td>
              <td data-label="Boater Capacity">{vehicle.boaterCapacity}</td>
              <td data-label="Boat Capacity">{vehicle.boatCapacity}</td>
              <td data-label="Action"><button onClick={() => onRemoveVehicle(vehicle.id)}>Remove</button></td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan="3"></td>  {/* Empty cells to span the previous columns */}
            <td>
              <button onClick={onClearVehicles}>Clear All</button>
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );

}

export default App;
