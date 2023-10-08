// App.test.js
import React from 'react';
import { render, fireEvent, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';  // for the "toHaveClass" matcher
import userEvent from '@testing-library/user-event';
import App from './App';
import db from './db';
import { act } from 'react-dom/test-utils';

async function populateDatabase() {
  try {
    await db.open();
    const tx = db.transaction('vehicles', 'readwrite');
    await db.vehicles.bulkAdd([
      {description: 'Vehicle 4', boaterCapacity: 4, boatCapacity: 3},
      {description: 'Vehicle 5', boaterCapacity: 2, boatCapacity: 1},
      {description: 'Vehicle 6', boaterCapacity: 7, boatCapacity: 6}
    ]);
    await tx.done;
  } catch (err) {
    console.error('Failed to populate database:', err);
  }
}

afterAll(async () => {
  // Cleanup database
  await db.vehicles.clear();
});

//beforeAll(async () => {
//  await populateDatabase();
//});

test('renders without crashing', async () => {
  
  render(<App />);
  //screen.debug();
//  await waitFor(async () => {
    //const vehicles = await db.vehicles.toArray();
    //const vehicle = await db.vehicles.where('description').equals('Vehicle 2').first();
//    const vehicles = await db.vehicles.where('description').equals('Vehicle 5').toArray();
    // console.log(vehicle);
    // const vehicles = [vehicle]
    // console.log(vehicles);
    // expect(vehicles).toEqual(expect.arrayContaining([{"boatCapacity": 1, "boaterCapacity": 2, "description": "Vehicle 5", "id": 2}])); //full match on the record
//    expect(vehicles).toEqual(expect.arrayContaining([expect.objectContaining({description: 'Vehicle 5', boaterCapacity: 2, boatCapacity: 1})]));
//  });

});


describe('find shuttle tests', ()=> {

  beforeEach(async () => {
    await populateDatabase();
  });

  afterEach(async () => {
    // Cleanup database
    await db.vehicles.clear();
  });

test('capacity error', async () => {
  render(<App />);
  userEvent.type(screen.getByPlaceholderText(/Total Boaters/i), '20');
  userEvent.type(screen.getByPlaceholderText(/Total Boats/i), '10');
  act(() => {
    userEvent.click(screen.getByText(/Highlight Shuttle Vehicles/i));
  });
  // Assuming there's not enough capacity
  expect(await waitFor(() => screen.findByText(/Not enough capacity to shuttle all boats and boaters./i))).toBeInTheDocument();
});

test('find shuttle 1:1', async () => {
  
  // db.vehicles.toArray().then(items => {
  //   console.log(items);
  // });

  render(<App />);

  userEvent.type(screen.getByPlaceholderText(/Total Boaters/i), '1');
  userEvent.type(screen.getByPlaceholderText(/Total Boats/i), '1');
  await waitFor(() => expect(screen.getByText('Vehicle 4')).toBeInTheDocument());
  act(() => {
    userEvent.click(screen.getByText(/Highlight Shuttle Vehicles/i));
  });
  //await waitFor(() => expect(screen.getByText('TableRow--selected')).toBeInTheDocument());
  const rows = await waitFor(() => screen.findAllByRole('row'));
  // screen.debug();
  
  // rows.forEach(element => {
  //   console.log(element.outerHTML || element.textContent || element.innerText);
  // });
  expect(rows[1].outerHTML).not.toContain('TableRow--selected');  
  expect(rows[2].outerHTML).toContain('TableRow--selected');  
  expect(rows[3].outerHTML).not.toContain('TableRow--selected'); 
});

});

test('can add vehicle 1', async () => {
  render(<App />);
  act(() => {
  userEvent.type(screen.getByPlaceholderText(/Vehicle Description/i), 'Vehicle 1');
  userEvent.type(screen.getByPlaceholderText(/Boater Capacity/i), '2');
  userEvent.type(screen.getByPlaceholderText(/Boat Capacity/i), '4');
  userEvent.click(screen.getByText(/Add Vehicle/i));
  });
  // Wait for the elements to appear in the document
  expect(await screen.findByText('Vehicle 1')).toBeInTheDocument();
  expect(await screen.findByText('2')).toBeInTheDocument();
  expect(await screen.findByText('4')).toBeInTheDocument();

 });


describe('remove tests', ()=> {

  beforeEach(async () => {
    await populateDatabase();
  });

  test('can clear all vehicles', async () => {
    render(<App />);
//    screen.debug();
   await waitFor(async () => {
     const vehicles = await db.vehicles.where('description').equals('Vehicle 5').toArray();
     expect(vehicles).toEqual(expect.arrayContaining([expect.objectContaining({description: 'Vehicle 5', boaterCapacity: 2, boatCapacity: 1})]));
   });
    
    act(() => {
      userEvent.click(screen.getByText(/Remove All/i));
      });
      // Wait for the elements to appear in the document
      //expect(await waitFor(() => screen.queryByText('Vehicle 5'))).not.toBeInTheDocument();
      const vehicles = await db.vehicles.where('description').equals('Vehicle 5').toArray();
      expect(vehicles).not.toEqual(expect.arrayContaining([expect.objectContaining({description: 'Vehicle 5', boaterCapacity: 2, boatCapacity: 1})]));
  });

  test('can remove vehicle 4', async () => {
    render(<App />);
    // Find all buttons with the text "Remove"
    const removeButtons = await waitFor(() => screen.getAllByText('Remove', { selector: 'button' }));
    //console.log(removeButtons);
    // Click the first button in the list
    act(() => { userEvent.click(removeButtons[0]); });
    //Wait for the elements to appear in the document
    //expect(await waitFor(() => screen.queryByText('Vehicle 4'))).not.toBeInTheDocument();
    //check the database instead
    const vehicles = await db.vehicles.where('description').equals('Vehicle 4').toArray();
    expect(vehicles).toHaveLength(0);
  });
});

