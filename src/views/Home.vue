<template>
  <nu-flow gap="4x">
    <nu-heading level="1" text="center w6">Календарь
      <nu-link to="!https://github.com/web-standards-ru/calendar">Веб-стандартов</nu-link>.
      <nu-el>Теперь наглядно.*</nu-el>
      <nu-block text="right w6" size="md">*non-official version</nu-block>
    </nu-heading>

    <nu-pane gap="2x" flow="row||column">
      <nu-attrs for="nu-btn" toggle="0 :active[1]" fill="bg :pressed[special-bg]"></nu-attrs>
      <nu-block>
        <nu-btngroup :value="type" @input="setPeriod($event.detail)" gap="1x" flow="row wrap">
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
      </nu-block>
      <nu-block width="15||clamp(initial, 100%, 20rem)">
        <nu-input :value="searchQuery" @input="searchQuery = $event.detail"
          placeholder="Город проведения" label="Поиск по городу" width="100%" columns="auto 1fr">
          <nu-icon name="search"></nu-icon>
        </nu-input>
      </nu-block>
    </nu-pane>

    <nu-grid id="events" role="list" gap="2x" columns="1fr 1fr 1fr | 1fr 1fr | 1fr">
      <nu-card
        v-for="event in shownEvents"
        :key="event.uid"
        role="listitem"
        display="grid"
        flow="column"
        rows="auto 1fr auto"
        padding="0"
        shadow="0 color(clear) :hover[1]">
          <nu-flex padding gap>
            <nu-icon name="calendar"></nu-icon>
            <nu-el v-if="getFormattedDate(event.start) === getFormattedDate(event.end)
            || event.daysCounted === 1">
              {{ getFormattedDate(event.start) }}
            </nu-el>

            <nu-flex v-if="getFormattedDate(event.start) !== getFormattedDate(event.end)
            && event.daysCounted !== 1" gap="0 1x" flow="row wrap">
              <nu-el>{{ getFormattedDate(event.start).slice(0, -7) }}</nu-el>
              <nu-el text="nowrap">
                &mdash;
                {{ event.endCorrected ? getFormattedDate(event.endCorrected)
              : getFormattedDate(event.end) }}
              </nu-el>
            </nu-flex>
          </nu-flex>

          <nu-blocklink :to="`!${event.description}`"
            display="grid"
            items="center stretch"
            theme="tint soft :hover[tint]"
            focusable="inset"
            padding="4x 2x"
            size="h3"
            text="no-decoration w6 center wrap">
            {{ event.summary }}
          </nu-blocklink>

          <nu-block>
            <nu-pane padding flow="row wrap" items="center|||flex-start">
              <nu-flex gap text="nowrap">
                <nu-icon name="clock"></nu-icon>
                <nu-el v-if="!event.allDay">c {{ getFormattedTime(event.start) }}
                  до {{ getFormattedTime(event.end) }}
                </nu-el>
                <nu-el v-if="event.allDay">{{ getDaysDeclension(event.daysCounted) }}
                </nu-el>
              </nu-flex>
              <nu-flex gap text="nowrap">
                <nu-icon name="map-pin"></nu-icon>
                <nu-el text="ellipsis">{{ event.location }}</nu-el>
              </nu-flex>
            </nu-pane>
          </nu-block>
      </nu-card>
    </nu-grid>


    <nu-block v-if="filteredEvents.length > shownLimit" text="center">
      <nu-btn v-on:click="shownLimit += limitStep" fill="special-bg">
        Показать ещё
      </nu-btn>
    </nu-block>

    <nu-block v-if="isLoaded" text="center">
      <p>Данные загружаются</p>
    </nu-block>

    <nu-block v-if="shownEvents.length === 0 && !isLoaded" text="center">
      <p>Событий
          <nu-el v-if="searchQuery">в данном городе</nu-el>
        не найдено
      </p>
    </nu-block>
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
