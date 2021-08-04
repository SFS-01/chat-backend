module.exports = {
    required: (field) => `${field.charAt(0).toUpperCase() + field.substr(1).toLowerCase()} is required`,
    unique: (field) => `${field.charAt(0).toUpperCase() + field.substr(1).toLowerCase()} already exists`,
    above: (field, rule, value) => `${field.charAt(0).toUpperCase() + field.substr(1).toLowerCase()} can't be lowest than ${value*1+1}`,
    'username.alpha': 'Username contains unallowed characters',
    'email.email': 'Please enter a valid email address',
    'password.min': (field, rule, value) => `Password is too short. The min is ${value}`,
    'confirmed': 'Confirmed password doesn\'t match'
}