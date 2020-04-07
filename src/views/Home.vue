<template>
  <div class='home'>
    <!-- <img alt='Vue logo' src='../assets/logo.png' /> -->
    <!-- <HelloWorld msg='Welcome to Your Vue.js App' /> -->
    <h1 class="visually-hidden">Календарь Веб-стандартов. Теперь наглядно.</h1>
    <div class="filters">
      <div class="period-btn-wrapper">
        <button class="period-btn btn" type="button"
          :class="{ active: type === 'future'}"
          v-on:click="
            type = 'future';
            shownLimit = limitStep;
            searchQuery = '';">
          Будущие
        </button>
        <button class="period-btn btn" type="button"
        :class="{ active: type === 'past'}"
          v-on:click="
            type = 'past';
            shownLimit = limitStep;
            searchQuery = '';">
          Прошедшие
        </button>
        <button class="period-btn btn" type="button"
        :class="{ active: type === 'today'}"
          v-on:click="
            type = 'today';
            searchQuery = '';">
          Сегодня
        </button>
      </div>
      <label>
        <span class="visually-hidden">Город</span>
        <input class="city-search" type="text" value="" v-model="searchQuery"
          placeholder="Город проведения"/>
      </label>
    </div>

    <ul class="events-list" id="events">
      <li class="events-item"
        v-for="event in shownEvents"
        :key="event.uid">
          <p class="events-item__date">
            <calendar-icon size="1x" class="events-item__icon"></calendar-icon>
            <span v-if="getFormattedDate(event.start) === getFormattedDate(event.end)
            || event.daysCounted === 1">
              {{ getFormattedDate(event.start) }}
            </span>

            <span v-if="getFormattedDate(event.start) !== getFormattedDate(event.end)
            && event.daysCounted !== 1">
              {{ getFormattedDate(event.start).slice(0, -7) }}
              &mdash;
              {{ event.endCorrected ? getFormattedDate(event.endCorrected)
              : getFormattedDate(event.end) }}
            </span>
          </p>

          <a class="events-item__link-wrapper" :href="event.description" target="_blank">
            <p class="events-item__name">{{ event.summary }}</p>
          </a>

          <div class="events-item__footer">
            <p class="events-item__time">
              <clock-icon size="1x" class="events-item__icon events-item__icon--time">
              </clock-icon>
              <span v-if="!event.allDay">c {{ getFormattedTime(event.start) }}
                до {{ getFormattedTime(event.end) }}
              </span>
              <span v-if="event.allDay">
                {{ getDaysDeclension(event.daysCounted) }}
              </span>
            </p>
            <p class="events-item__location">
              <map-pin-icon size="1x" class="events-item__icon"></map-pin-icon>
              {{ event.location }}
            </p>
          </div>
      </li>
    </ul>


    <div class="show-more-btn-wrapper" v-if="filteredEvents.length > shownLimit">
      <button class="btn active show-more-btn" type="button" v-on:click="shownLimit += limitStep">
        Показать ещё
      </button>
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
import { MapPinIcon, ClockIcon, CalendarIcon } from 'vue-feather-icons';
import EventsService from '../services/events-service';

export default {
  name: 'Home',
  components: {
    MapPinIcon,
    ClockIcon,
    CalendarIcon,
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

  },
};
</script>

<style lang="scss">
  body {
    margin: 0;
    padding: 0;
    padding-bottom: 40px;
    background-color: #F1F7FA;
    // background-color: #f7f9fe;
  }

  .visually-hidden:not(:focus):not(:active),
  input[type="checkbox"].visually-hidden,
  input[type="radio"].visually-hidden {
    position: absolute;
    width: 1px;
    height: 1px;
    margin: -1px;
    border: 0;
    padding: 0;

    white-space: nowrap;

    clip-path: inset(100%);
    clip: rect(0 0 0 0);
    overflow: hidden;
  }

  .home {
    width: 90%;
    margin: 0 auto;
  }

  .btn {
    min-width: 125px;
    height: 36px;
    padding: 10px;
    box-sizing: border-box;
    color: #49839f;
    font-size: 16px;
    font-weight: bold;
    line-height: 16px;
    border: none;
    border-radius: 5px;
    background-image: none;
    background-color: transparent;
    cursor: pointer;

    &:hover,
    &:focus {
      border-bottom: 2px solid #49839f;
    }
  }

  .btn.active {
    color: white;
    filter: hue-rotate(45deg);
    background-image: linear-gradient(-45deg, #a5d85f, #6399b3);
    transition: all 0.2s ease;
  }

  .filters {
    @media (min-width: 768px) {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
    }

    @media (min-width: 1100px) {
      width: 90%;
      margin: 0 auto;
    }
  }

  .period-btn-wrapper {
    @media (max-width: 767px) {
      margin-bottom: 20px;
    }

    @media (min-width: 768px) {
      display: flex;
      justify-content: space-between;
    }
  }

  .period-btn {
    @media (max-width: 767px) {
      font-size: 18px;

      &:first-child {
        margin-right: 20px;
      }

      &:last-child {
        margin-top: 15px;
      }
    }

    @media (min-width: 768px) {
      &:not(:last-child) {
        margin-right: 20px;
      }
    }
  }

  .city-search {
    width: 180px;
    height: 36px;
    padding: 10px;
    box-sizing: border-box;
    border: 1px solid grey;
    border-radius: 5px;
    font-size: 16px;
  }

  .events-list {
    list-style-type: none;
    padding-left: 0;
    margin-top: 45px;
    margin-bottom: 40px;

    @media (min-width: 768px) {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 23px 20px;
    }

    @media (min-width: 1100px) {
      // grid-template-columns: 27% 27% 27%; найти фикс для IE
      grid-template-columns: 1fr 1fr 1fr;
    }
  }

  .events-item {
    display: flex;
    flex-direction: column;
    border-radius: 5px;
    padding: 10px;
    border: 1px solid #49839f;
    background-color: #fafafd;
    border-radius: 5px;
    transition: all 0.1s ease;

    &__time-icon {
      vertical-align: middle;
    }

    &:hover,
    &:focus {
      box-shadow: 0px 0px 27px -15px;
    }

    & > p {
      margin-top: 0;
    }

    &__date,
    &__time,
    &__location {
      font-size: 16px;
      font-weight: 500;
      text-align: left;
      line-height: 16px;
    }

    &__date {
      margin-bottom: 8px;
    }

    &__link-wrapper {
      display: grid;
      place-content: center;
      flex-grow: 1;
      min-height: 100px;
      margin-left: -10px;
      margin-right: -10px;
      margin-bottom: 8px;
      text-decoration: none;
      color: #2a5265;
      transition: all 0.1s ease;

      @media (hover: hover) {
        &:hover p,
        &:focus p {
          color: #54819d;
        }

        &:hover,
        &:focus {
          background-color: #e6e6e6;
        }
      }

    }

    @media (max-width: 767px) {
      margin-bottom: 20px;
    }

    &__name {
      margin-top: 0;
      margin-bottom: 0;
      padding: 20px 25px;
      font-size: 25px;
      font-weight: 600;
      color: #77bcab;
      line-height: 30px;
    }

    &__footer {
      display: flex;
      justify-content: space-between;
      line-height: 16px;

      & > p {
        margin-top: 0;
        margin-bottom: 0;
      }
    }

    &__icon {
      vertical-align: -0.15em;

      &--time {
        margin-right: 5px;
      }
    }
  }

  .show-more-btn {
    width: 150px;
    margin-bottom: 40px;
  }

</style>
