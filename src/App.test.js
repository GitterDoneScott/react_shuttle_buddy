// App.test.js
import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
import { act } from 'react-dom/test-utils';

test('renders without crashing', () => {
  render(<App />);
});

test('can add a vehicle', async () => {
  render(<App />);
  act(() =>{ 
  userEvent.type(screen.getByPlaceholderText(/Vehicle Description/i), 'Vehicle 1');
  userEvent.type(screen.getByPlaceholderText(/Boater Capacity/i), '2');
  userEvent.type(screen.getByPlaceholderText(/Boat Capacity/i), '4');
  userEvent.click(screen.getByText(/Add Vehicle/i));
});
  expect(screen.getByText('Vehicle 1')).toBeInTheDocument();
  expect(screen.getByText('2')).toBeInTheDocument();
  expect(screen.getByText('4')).toBeInTheDocument();
});

// test('can remove a vehicle', async () => {
//   render(<App />);
//   // Assuming a vehicle has been added already
//   userEvent.click(screen.getByText(/Remove/i));
//   expect(screen.queryByText('Vehicle 1')).not.toBeInTheDocument();
// });

// test('can clear all vehicles', async () => {
//   render(<App />);
//   // Assuming vehicles have been added already
//   userEvent.click(screen.getByText(/Clear/i));
//   expect(screen.queryByText('Vehicle 1')).not.toBeInTheDocument();
// });

// test('can calculate capacities', () => {
//   render(<App />);
//   userEvent.type(screen.getByPlaceholderText(/Total Boaters/i), '20');
//   userEvent.type(screen.getByPlaceholderText(/Total Boats/i), '10');
//   userEvent.click(screen.getByText(/Calculate/i));
//   // Assuming there's not enough capacity
//   expect(screen.getByText(/Not enough capacity to shuttle all boats and boaters./i)).toBeInTheDocument();
// });
