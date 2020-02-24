<template>
  <div class='home'>
    <img alt='Vue logo' src='../assets/logo.png' />
    <!-- <HelloWorld msg='Welcome to Your Vue.js App' /> -->
    <ul class='events-list' id='events'>
      <li class='events-item' v-for='event in events' :key='event.uid'>
        <p class='events-item__name'>{{ event.summary }}</p>
        <p class='events-item__date'>Дата проведения: {{ getFormattedDate(event.start) }}
          <span v-if="getFormattedDate(event.start) !== getFormattedDate(event.start)">
            до {{ getFormattedDate(event.end) }}</span></p>
        <p>
          Время проведения: c {{ getFormattedTime(event.start) }}
          до {{ getFormattedTime(event.end) }}
        </p>
        <p class='events-item__location'>г. {{ event.location }}</p>
        <a class='events-item__orgs' :href='event.description' alt='' target="_blank">Подробнее</a>
      </li>
    </ul>
  </div>

  <!-- https://web-standards.ru/calendar.json для fetch -->

  <!-- 'uid': '2020-02-29-ya-love-frontend',
    'start': '2020-02-29T08:00:00.000Z',
    'end': '2020-02-29T17:00:00.000Z',
    'summary': 'Я ❤︎ Фронтенд 2020',
    'location': 'Москва',
  'description': 'https://ilovefrontend.ru/'-->
</template>

<script>
// @ is an alias to /src
// import HelloWorld from '@/components/HelloWorld.vue';
import EventsService from '../services/events-service';

export default {
  name: 'Home',
  components: {
    // HelloWorld,
  },
  data() {
    return {
      events: [
        {
          uid: '2020-02-29-ya-love-frontend',
          start: '2020-02-29T08:00:00.000Z',
          end: '2020-02-29T17:00:00.000Z',
          summary: 'Я ❤︎ Фронтенд 2020',
          location: 'Москва',
          description: 'https://ilovefrontend.ru/',
        },
        {
          uid: '2020-03-05-developer-circles',
          start: '2020-03-05T15:30:00.000Z',
          end: '2020-03-05T18:30:00.000Z',
          summary: 'Developer Circles',
          location: 'Москва',
          description:
            'https://facebook-developer-circle-moscow-front-end.splashthat.com/',
        },
        {
          uid: '2020-03-14-js-fwdays',
          start: '2020-03-14T00:00:00.000Z',
          end: '2020-03-15T00:00:00.000Z',
          summary: 'JavaScript fwdays',
          location: 'Киев',
          description: 'https://fwdays.com/en/event/js-fwdays-2020',
          allDay: true,
        },
        {
          uid: '2020-03-28-kharkivcss',
          start: '2020-03-28T08:00:00.000Z',
          end: '2020-03-28T17:00:00.000Z',
          summary: 'KharkivCSS #5',
          location: 'Харьков',
          description: 'http://kharkivcss.org/',
        },
        {
          uid: '2020-04-10-holyjs-piter',
          start: '2020-04-10T00:00:00.000Z',
          end: '2020-04-12T00:00:00.000Z',
          summary: 'HolyJS Piter',
          location: 'Санкт-Петербург',
          description: 'https://holyjs-piter.ru/',
          allDay: true,
        },
        {
          uid: '2020-04-21-smashingconf-san-francisco',
          start: '2020-04-21T00:00:00.000Z',
          end: '2020-04-23T00:00:00.000Z',
          summary: 'SmashingConf',
          location: 'Сан-Франциско',
          description: 'https://smashingconf.com/sf-2020/',
          allDay: true,
        },
      ],
    };
  },
  eve: [],
  async mounted() {
    const rawData = await EventsService.getAll();
    const data = await rawData.json();
    const currentDate = new Date().toJSON().slice(0, 10);
    const futureEvents = [];
    const pastEvents = [];
    data.forEach((element) => {
      if (element.end.slice(0, 10) < currentDate) {
        pastEvents.push(element);
      } else {
        futureEvents.push(element);
      }
    });
    console.log(futureEvents[1].end + futureEvents[1].start);
  },
  methods: {
    getFormattedDate(rawDate) {
      return new Date(rawDate).toLocaleDateString();
    },
    getFormattedTime(rawDate) {
      return new Date(rawDate).toLocaleTimeString().slice(0, 5);
    },
  },
};
</script>
