<style lang="scss">
.events-list {
  display: grid;
  padding-left: 0;
  grid-template-columns: 1fr 1fr 1fr;
  list-style-type: none;
  gap: 20px 10px;
}

.events-item {
  &__name {
    color: red;
  }
}
</style>

<template>
  <div class='home'>
    <!-- <img alt='Vue logo' src='../assets/logo.png' /> -->
    <!-- <HelloWorld msg='Welcome to Your Vue.js App' /> -->
    <button type="button" v-on:click="type = 'future'; shownLimit = limitStep">Будущие</button>
    <button type="button" v-on:click="type = 'past'; shownLimit = limitStep">Прошедшие</button>
    <button type="button" v-on:click="type = 'today'">Сегодня</button>
    <input type="text" value="" v-model="searchQuery" placeholder="Город проведения"/>

    <ul class="events-list" id="events">
      <li class="events-item" v-for="event in shownEvents" :key="event.uid">
        <p class="events-item__name">{{ event.summary }}</p>
        <p class="events-item__date">Дата проведения: {{ getFormattedDate(event.start) }}
          <span v-if="getFormattedDate(event.start) !== getFormattedDate(event.end)">
            до {{ getFormattedDate(event.end) || 'ночи' }} </span>
        </p>
        <p>
          Время проведения:
          <span v-if="!event.allDay"> c {{ getFormattedTime(event.start) }}
            до {{ getFormattedTime(event.end) }} </span>
          <span v-if="event.allDay">весь день</span>
        </p>
        <p class="events-item__location">г. {{ event.location }}</p>
        <a class="events-item__orgs" :href="event.description" alt="" target="_blank">Подробнее</a>
      </li>
    </ul>

    <div class="show-more-btn-wrapper" v-if="filteredEvents.length > shownLimit">
      <button type="button" v-on:click="shownLimit += limitStep">Показать ещё</button>
    </div>

    <div class="upload-data" v-if="isLoaded">
      <p>Данные загружаются</p>
    </div>

    <div class="empty-search-result" v-if="shownEvents.length === 0 && !isLoaded">
      <p>Событий
          <span v-if="searchQuery">в данном городе</span>
        не найдено
      </p>
    </div>
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
      isLoaded: true,
      shownLimit: 10,
      limitStep: 10,
      isCashed: false,
    };
  },
  async mounted() {
    const rawData = await EventsService.getAll();
    const data = await rawData.json();
    const currentDate = new Date().toJSON().slice(0, 10);
    const futureEvents = [];
    const pastEvents = [];
    data.forEach((element) => {
      /* eslint-disable-next-line no-param-reassign */
      element.searchLocation = element.location.toLowerCase();
      if (element.end.slice(0, 10) < currentDate) {
        pastEvents.push(element);
      } else {
        futureEvents.push(element);
      }
    });
    this.futureEvents = futureEvents;
    this.pastEvents = pastEvents.reverse();
    this.currentDate = currentDate;
    this.isLoaded = false;
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
      return currentEvent;
    },
    filteredEvents() {
      if (this.searchQuery.length > 1) {
        const searchValue = this.searchQuery.toLowerCase();
        return this.events.filter((event) => event.searchLocation.includes(searchValue));
      }
      return [...this.events];
    },
    shownEvents() {
      return this.filteredEvents.slice(0, this.shownLimit);
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
