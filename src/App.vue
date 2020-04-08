<template>
  <nu-flex id="app" padding="2x" flow="column" items="center">
    <!-- <div id="nav">
      <router-link to="/">События</router-link> |
      <router-link to="/about">О календаре</router-link>
    </div> -->
    <nu-block width="90%">
      <router-view/>
    </nu-block>
    <nu-block>
      made w/love by
      <nu-link to="!https://github.com/katrinLuna">
        Katrin Luna
      </nu-link>
    </nu-block>
  </nu-flex>
</template>
