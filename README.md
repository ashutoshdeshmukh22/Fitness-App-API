## Description
Fitness App API

## Tech Stack Used
- Node Js
- Express Js 
- MongoDB and Mongoose

## Tool Used For Testing API Endpoints
- Postman

## Admin
- Register / Login
- Add Workout
- Add Exercise
- Fetch All Workouts
- Fetch All Exercises

## User
- Register / Login
- Perform A Exercise / Workout
- Fetch User Performed Exercises / Workout
- Fetch Number of Workout / Exercise Performed and Total Duration

(You Can sort the data by category,by age group, by duration, by purpose, by performed count. in ascending or descending order)

## API Endpoints For Admin

```bash
# Register
http://localhost:3000/signup
```
```bash
# Login
http://localhost:3000/login
```
```bash
# Log Out
http://localhost:3000/logout
```
```bash
# Add / Create Workout
http://localhost:3000/admin/add-workout
```
```bash
# Add / Create Exercise
http://localhost:3000/admin/add-exercise
```
```bash
# Fetch Workouts
http://localhost:3000/admin/get-workout/?sortby='value'&mode='value'
```
```bash
# Exercises Workouts
http://localhost:3000/admin/get-exercise/?sortby='value'&mode='value'
```

## API Endpoints For User

```bash
# Register
http://localhost:3000/signup
```
```bash
# Login
http://localhost:3000/login
```
```bash
# Log Out
http://localhost:3000/logout
```
```bash
# Perform Exercise
http://localhost:3000/user/perform-exercise/'exerciseId'?action='start/stop'
```
```bash
# Fetch Performed Workouts
http://localhost:3000/user/get-workout/?sortby='value'&mode='value'
```
```bash
# Fetch Performed Exercises
http://localhost:3000/user/get-exercise/?sortby='value'&mode='value'
```
```bash
# Fetch Total Performed - Number of exercises performed, number of workouts performed, and total duration for which all the exercise/workout performed.
http://localhost:3000/user/get-total-performed/
```

## Installation

```bash
$ npm install
```

## Running the app

```bash
$ npm start
```
..