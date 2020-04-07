<template>
  <div id="app">
    <!-- <div id="nav">
      <router-link to="/">События</router-link> |
      <router-link to="/about">О календаре</router-link>
    </div> -->
    <router-view/>
    <p class="project-autor">
      made w/love by
      <a class="project-autor__name" href="https://github.com/katrinLuna" target="_blank">
        Katrin Luna
      </a>
    </p>
  </div>
</template>

<style lang="scss">
body {
  margin: 0;
  padding: 0;
  padding-bottom: 25px;
  background-color: #F1F7FA;
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

#app {
  font-family: "Avenir Next", Avenir, "Helvetica Neue", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

#nav {
  padding: 30px;
  display: flex;

  a {
    font-weight: bold;
    font-size: 20px;
    color: #2c3e50;
    flex-basis: 50%;

    &.router-link-exact-active {
      color: #42b983;
    }

    &:first-child {
     text-align: right;
     margin-right: 10px;
    }

    &:last-child {
      text-align: left;
      margin-left: 10px;
    }
  }
}
</style>
