<template>
  <div id="app">
    <div id="nav">
      <router-link to="/">События</router-link> |
      <router-link to="/about">О календаре</router-link>
    </div>
    <router-view/>
  </div>
</template>

<style lang="scss">
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
