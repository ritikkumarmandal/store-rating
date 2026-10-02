export const rules = {
  name: (v) => (v.length < 20 || v.length > 60) ? 'Name must be 20-60 characters' : '',
  email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? '' : 'Enter a valid email',
  address: (v) => v.length > 400 ? 'Address must be at most 400 characters' : '',
  password: (v) => {
    if (v.length < 8 || v.length > 16) return 'Password must be 8-16 characters';
    if (!/[A-Z]/.test(v)) return 'Password needs one uppercase letter';
    if (!/[^A-Za-z0-9]/.test(v)) return 'Password needs one special character';
    return '';
  },
};
export const validate = (values, fields) =>
  Object.fromEntries(fields.map((f) => [f, rules[f](values[f] || '')]).filter(([, m]) => m));
