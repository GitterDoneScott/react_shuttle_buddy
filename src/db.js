import Dexie from 'dexie';

const db = new Dexie('VehiclesDB');
db.version(1).stores({
  vehicles: '++id, description, boaterCapacity, boatCapacity'
});

export default db;