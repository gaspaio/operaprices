<template>
    <div class="header clearfix">
        <div>
            <nav><ul class="nav nav-pills pull-right">
                <li role="presentation"><router-link to="/">Home</router-link></li>
                <li role="presentation"><router-link to="about">About</router-link></li>
            </ul></nav>
            <h3 class="text-muted">Opera Prices</h3>
            </div>
        <p>The current lowest prices at the Paris Opera</p>
    </div>
</template>

<script>
export default {
  name: 'AppHeader'
}
</script>

<style>
.header {
  padding-bottom: 20px;
/*  border-bottom: 1px solid #e5e5e5;*/
}
</style>
