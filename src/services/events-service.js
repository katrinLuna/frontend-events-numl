export default {
  name: 'EventsService',
  getAll() {
    return fetch('https://web-standards.ru/calendar.json');
  },
};
