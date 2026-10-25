/**
 * Form Validation utilities for RailRakshak
 */

export function isValidIndianMobile(number) {
  if (!number) return false;
  // Clean spaces, hyphens, and leading +91 / 0
  const cleaned = number.replace(/[\s\-\+]/g, '').replace(/^91/, '').replace(/^0/, '');
  // Must be 10 digits starting with 5-9
  return /^[5-9]\d{9}$/.test(cleaned);
}

export function cleanMobile(number) {
  if (!number) return '';
  return number.replace(/[\s\-\+]/g, '').replace(/^91/, '').replace(/^0/, '');
}

export function validatePassengerForm(passenger) {
  const errors = {};

  if (!passenger.fullName || !passenger.fullName.trim()) {
    errors.fullName = 'Full Name is required';
  } else if (passenger.fullName.trim().length < 2) {
    errors.fullName = 'Please enter a valid full name (min 2 characters)';
  }

  const ageNum = Number(passenger.age);
  if (!passenger.age && passenger.age !== 0) {
    errors.age = 'Age is required';
  } else if (isNaN(ageNum) || ageNum < 1 || ageNum > 120) {
    errors.age = 'Please enter a valid age between 1 and 120';
  }

  if (!passenger.mobileNumber || !passenger.mobileNumber.trim()) {
    errors.mobileNumber = 'Mobile number is required';
  } else if (!isValidIndianMobile(passenger.mobileNumber)) {
    errors.mobileNumber = 'Enter a valid 10-digit mobile number';
  }

  if (!passenger.emergencyContactName || !passenger.emergencyContactName.trim()) {
    errors.emergencyContactName = 'Emergency contact name is required';
  }

  if (!passenger.emergencyContactMobile || !passenger.emergencyContactMobile.trim()) {
    errors.emergencyContactMobile = 'Emergency contact mobile is required';
  } else if (!isValidIndianMobile(passenger.emergencyContactMobile)) {
    errors.emergencyContactMobile = 'Enter a valid 10-digit contact mobile';
  } else if (cleanMobile(passenger.mobileNumber) === cleanMobile(passenger.emergencyContactMobile)) {
    errors.emergencyContactMobile = 'Emergency contact should differ from your own mobile';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

export function validateJourneyForm(journey) {
  const errors = {};

  if (!journey.trainNumber || !journey.trainNumber.trim()) {
    errors.trainNumber = 'Train number is required';
  } else if (!/^[0-9A-Za-z]{4,6}$/.test(journey.trainNumber.trim())) {
    errors.trainNumber = 'Please enter a valid train number (e.g. 12004 or 12301)';
  }

  if (!journey.boardingStation || !journey.boardingStation.trim()) {
    errors.boardingStation = 'Boarding station is required';
  }

  if (!journey.destinationStation || !journey.destinationStation.trim()) {
    errors.destinationStation = 'Destination station is required';
  }

  if (
    journey.boardingStation &&
    journey.destinationStation &&
    journey.boardingStation.trim().toLowerCase() === journey.destinationStation.trim().toLowerCase()
  ) {
    errors.destinationStation = 'Destination cannot be the same as boarding station';
  }

  if (!journey.journeyDate) {
    errors.journeyDate = 'Journey date is required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}
