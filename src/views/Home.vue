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
    <button type="button" v-on:click="type = 'future'">Будущие</button>
    <button type="button" v-on:click="type = 'past'">Прошедшие</button>
    <button type="button" v-on:click="type = 'today'">Сегодня</button>
    <input type="text" value="" v-model="searchQuery" placeholder="Город проведения"/>

    <div class="show-more-btn-wrapper" v-if="type === 'past'">
      <button type="button">Показать ещё</button>
    </div>

    <ul class="events-list" id="events">
      <li class="events-item" v-for="event in events" :key="event.uid">
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
    <div class="upload-data" v-if="isLoaded">
      <p>Данные загружаются</p>
    </div>

    <div class="empty-search-result" v-if="events.length === 0 && !isLoaded">
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
      if (this.searchQuery.length > 2) {
        return currentEvent.filter((event) => event.location.includes(this.searchQuery));
      }
      return currentEvent;
    },
    // limit в дату положить, а тут хранить по лимиту обрезанное число
    // элементов отображения элементов - увеличивать при нажатии на кнопку
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
