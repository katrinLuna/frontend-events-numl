<template>
  <div class='home'>
    <!-- <img alt='Vue logo' src='../assets/logo.png' /> -->
    <!-- <HelloWorld msg='Welcome to Your Vue.js App' /> -->
    <button type="button" v-on:click="type = 'future'">Будущие</button>
    <button type="button" v-on:click="type = 'past'">Прошедшие</button>
    <button type="button" v-on:click="type = 'today'">Сегодня</button>
    <input type="text" value="" v-model="searchQuery" placeholder="Город проведения"/>
    <ul class='events-list' id='events'>
      <li class='events-item' v-for='event in events' :key='event.uid'>
        <p class='events-item__name'>{{ event.summary }}</p>
        <p class='events-item__date'>Дата проведения: {{ getFormattedDate(event.start) }}
          <span v-if="getFormattedDate(event.start) !== getFormattedDate(event.end)">
            до {{ getFormattedDate(event.end) || 'ночи' }} </span>
        </p>
        <p>
          Время проведения:
          <span v-if="!event.allDay"> c {{ getFormattedTime(event.start) }}
            до {{ getFormattedTime(event.end) }} </span>
          <span v-if="event.allDay">весь день</span>
        </p>
        <p class='events-item__location'>г. {{ event.location }}</p>
        <a class='events-item__orgs' :href='event.description' alt='' target="_blank">Подробнее</a>
      </li>
    </ul>
  </div>
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
      pastEvents: [],
      futureEvents: [],
      type: 'future',
      searchQuery: '',
      currentDate: '',
    };
  },
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
    this.futureEvents = futureEvents;
    this.pastEvents = pastEvents.reverse();
    this.currentDate = currentDate;
  },
  computed: {
    events() {
      let currentEvent = [];
      switch (this.type) {
        case 'future':
          currentEvent = this.futureEvents;
          break;
        case 'past':
          currentEvent = this.pastEvents;
          break;
        case 'today':
          currentEvent = this.futureEvents
            .filter((event) => event.start.slice(0, 10) === this.currentDate);
          break;
        default:
          currentEvent = this.futureEvents;
          break;
      }
      if (this.searchQuery.length > 2) {
        return currentEvent.filter((event) => event.location.includes(this.searchQuery));
      }
      return currentEvent;
    },
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
