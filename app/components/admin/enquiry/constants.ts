export const branchOptions = ['Aurobindo', 'Bapat Square', 'Nanda Nagar', 'Online'];

export const enquiryMethodOptions = ['Call', 'Online', 'Revisit', 'Visit', 'Whatsapp'];

export const sourceOptions = ['Friend', 'Google', 'Main Board', 'Other Board', 'Social Media', 'Whatsapp'];

export const areaOptions = [
  'Alwasa', 'Anjani Nagar', 'Bardari', 'Bajrang Nagar', 'Bhagirath Pura',
  'Bhamori', 'Chhoti Khajrani', 'Cleark Colony', 'Dewas Naka', 'Gauri Nagar',
  'Kanak Smart City', 'LIG', 'Nehru Nagar', 'Nanda Nagar', 'Other',
  'Patnipura', 'Premium Park', 'Rewati', 'Robot Square', 'Shankheshwar',
  'Shyam Nagar', 'Vijay Nagar'
].sort();

export const enquiredForOptions = [
  'Brother', 'Daughter', 'Friend', 'Grand Daughter', 'Grand Son',
  'Husband', 'Other', 'Self', 'Sister', 'Son', 'Wife'
].sort();

export const ownerOptions = ['Brother', 'Father', 'Mother', 'Other', 'Sister', 'Student'].sort();

export const lastEducationOptions = ['12th', 'Diploma', 'Graduation', 'Other', 'Post Graduation'].sort();

export const genderOptions = ['Male', 'Female', 'Other'];

export const maritalStatusOptions = ['Single', 'Married', 'Other'];

export const courseOptions = [
  'Basic Computer', 'C', 'C++', 'Digital Marketing', 'English Typing',
  'Excel', 'Graphic Design', 'Hindi Typing', 'Java', 'Other', 'Python',
  'Spoken English', 'Tally', 'Web Development'
]
.sort()
.map(option => ({ value: option, label: option }));
