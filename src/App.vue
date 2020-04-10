<template>
  <nu-flex id="app" flow="column" items="center" gap="4x" padding="4x 0"
    responsive="1160px|768px|425px" text="w5" fill="subtle" height="min(100vh)">
    <nu-theme hue="#77bcab"></nu-theme>
    <!-- <div id="nav">
      <router-link to="/">События</router-link> |
      <router-link to="/about">О календаре</router-link>
    </div>-->
    <nu-block width="90%" grow="1">
      <router-view />
    </nu-block>
    <nu-block text="w4">
      made w/love and
      <nu-link to="!https://numl.design/" text="w5">NuML</nu-link>
      by
      <nu-link to="!https://github.com/katrinLuna" text="w5">Katrin Luna</nu-link>
    </nu-block>
  </nu-flex>
</template>
