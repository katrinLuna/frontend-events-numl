<template>
  <nu-flow gap="4x">
    <!-- <img alt='Vue logo' src='../assets/logo.png' /> -->
    <!-- <HelloWorld msg='Welcome to Your Vue.js App' /> -->
    <nu-heading level="1">Календарь
      <nu-link to="!https://github.com/web-standards-ru/calendar">Веб-стандартов</nu-link>.
      <nu-el>Теперь наглядно.*</nu-el>
      <nu-el>*non-official version</nu-el>
    </nu-heading>

    <nu-pane>
      <nu-btngroup
        :value="type"
        @input="setPeriod($event.detail)">
        <nu-btn value="future">
          Будущие
        </nu-btn>
        <nu-btn value="past">
          Прошедшие
        </nu-btn>
        <nu-btn value="today">
          Сегодня
        </nu-btn>
      </nu-btngroup>
      <label>
        <nu-el class="visually-hidden">Город</nu-el>
        <input class="city-search" type="text" value="" v-model="searchQuery"
          placeholder="Город проведения"/>
      </label>
    </nu-pane>

    <nu-grid id="events" role="list" gap="2x" columns="1fr 1fr 1fr | 1fr 1fr | 1fr">
      <nu-card
        padding
        v-for="event in shownEvents"
        :key="event.uid">
          <nu-block>
            <nu-icon name="calendar"></nu-icon>
            <nu-el v-if="getFormattedDate(event.start) === getFormattedDate(event.end)
            || event.daysCounted === 1">
              {{ getFormattedDate(event.start) }}
            </nu-el>

            <nu-el v-if="getFormattedDate(event.start) !== getFormattedDate(event.end)
            && event.daysCounted !== 1">
              {{ getFormattedDate(event.start).slice(0, -7) }}
              &mdash;
              {{ event.endCorrected ? getFormattedDate(event.endCorrected)
              : getFormattedDate(event.end) }}
            </nu-el>
          </nu-block>

          <nu-blocklink :to="`!${event.description}`">
            {{ event.summary }}
          </nu-blocklink>

          <nu-pane>
            <nu-block>
              <nu-icon name="clock"></nu-icon>
              <nu-el v-if="!event.allDay">c {{ getFormattedTime(event.start) }}
                до {{ getFormattedTime(event.end) }}
              </nu-el>
              <nu-el v-if="event.allDay">{{ getDaysDeclension(event.daysCounted) }}
              </nu-el>
            </nu-block>
            <nu-block>
              <nu-icon name="map-pin"></nu-icon>
              {{ event.location }}
            </nu-block>
          </nu-pane>
      </nu-card>
    </nu-grid>


    <div class="show-more-btn-wrapper" v-if="filteredEvents.length > shownLimit">
      <nu-btn v-on:click="shownLimit += limitStep">
        Показать ещё
      </nu-btn>
    </div>

    <div class="upload-data" v-if="isLoaded">
      <p>Данные загружаются</p>
    </div>

    <div class="empty-search-result" v-if="shownEvents.length === 0 && !isLoaded">
      <p>Событий
          <nu-el v-if="searchQuery">в данном городе</nu-el>
        не найдено
      </p>
    </div>
  </nu-flow>
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
      if (element.allDay) {
        /* eslint-disable-next-line no-param-reassign */
        element.daysCounted = Math.ceil((new Date(element.end).getTime()
        - new Date(element.start).getTime())
         / 24 / 3600 / 1000);
        /* eslint-disable-next-line no-param-reassign */
        element.endCorrected = new Date(new Date(element.end).getTime() - (1000 * 3600 * 24));
        // minus 1 day for event ends at midnight
      }
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
      return new Date(rawDate).toLocaleString('ru-RU', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    },
    getFormattedTime(rawDate) {
      return new Date(rawDate).toLocaleTimeString('ru-RU', { hour12: false }).slice(0, 5);
    },
    getDaysDeclension(dayNumber) {
      let word;
      if (dayNumber === 1) {
        word = 'весь день';
      } else if (dayNumber > 1 || dayNumber < 5) {
        // eslint-disable-next-line prefer-template
        word = dayNumber + ' дня';
      } else {
        // eslint-disable-next-line prefer-template
        word = dayNumber + ' дней';
      }
      return word;
    },
    setPeriod(type) {
      this.type = type;
      this.shownLimit = this.limitStep;
      this.searchQuery = '';
    },

  },
};
</script>
