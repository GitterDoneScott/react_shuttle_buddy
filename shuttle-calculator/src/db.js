// src/db.js
import Dexie from 'dexie';

const db = new Dexie('VehiclesDB');
db.version(1).stores({
  vehicles: '++id, description, passengerCapacity, boatCapacity'
});

export default db;